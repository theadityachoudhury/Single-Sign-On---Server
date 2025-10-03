import { MongoDBConnection } from '@/database/connections/mongodb.connections';
import { Collection, Db, ObjectId } from 'mongodb';
import { IBaseRepository, PaginatedResult, QueryOptions } from '../interfaces/base.repository.interface';

// This is a base repository class for MongoDB that implements common CRUD operations.
// It can be extended by other repositories to provide specific functionality.
// It uses MongoDB's native driver to interact with the database and provides methods

export abstract class BaseMongoRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
    implements IBaseRepository<T, CreateDTO, UpdateDTO> {

    protected db: Db;
    protected collection: Collection;

    constructor(protected collectionName: string) {
        this.db = MongoDBConnection.getInstance().getDatabase();
        this.collection = this.db.collection(collectionName);
    }

    protected convertToObjectId(id: string): ObjectId {
        try {
            return new ObjectId(id);
        } catch (error: unknown) {
            if (error instanceof Error && error.message.includes('ObjectId')) {
                // Handle invalid ObjectId format
                console.error(`Invalid ObjectId format: ${id}`, error);
            }
            throw new Error(`Invalid ObjectId format: ${id}`);
        }
    }

    protected createIdFilter(id: string): any {
        if (ObjectId.isValid(id) && id.length === 24) {
            return { _id: new ObjectId(id) };
        }
        return { _id: id };
    }

    async findById(id: string): Promise<T | null> {
        const filter = this.createIdFilter(id);
        const doc = await this.collection.findOne(filter);
        return doc ? this.mapFromMongo(doc) : null;
    }

    async findMany(filter: Record<string, any> = {}, options: QueryOptions = {}): Promise<T[]> {
        let cursor = this.collection.find(filter);

        if (options.sort) cursor = cursor.sort(options.sort);
        if (options.skip) cursor = cursor.skip(options.skip);
        if (options.limit) cursor = cursor.limit(options.limit);
        if (options.select) cursor = cursor.project(options.select);

        const docs = await cursor.toArray();
        return docs.map(doc => this.mapFromMongo(doc));
    }

    async create(data: CreateDTO): Promise<T> {
        const docToInsert = this.mapToMongo(data);
        const result = await this.collection.insertOne(docToInsert);

        return this.mapFromMongo({
            ...docToInsert,
            _id: result.insertedId
        });
    }

    async update(id: string, data: UpdateDTO): Promise<T | null> {
        const filter = this.createIdFilter(id);
        const updateDoc = this.mapToMongo(data);

        const result = await this.collection.findOneAndUpdate(
            filter,
            { $set: { ...updateDoc, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        return result ? this.mapFromMongo(result) : null;
    }

    async delete(id: string): Promise<boolean> {
        const filter = this.createIdFilter(id);
        const result = await this.collection.deleteOne(filter);
        return result.deletedCount > 0;
    }

    async count(filter: Record<string, any> = {}): Promise<number> {
        return await this.collection.countDocuments(filter);
    }

    async exists(id: string): Promise<boolean> {
        const filter = this.createIdFilter(id);
        const doc = await this.collection.findOne(filter, { projection: { _id: 1 } });
        return !!doc;
    }

    protected async findWithPagination(
        filter: Record<string, any> = {},
        page: number,
        limit: number,
        options: QueryOptions = {}
    ): Promise<PaginatedResult<T>> {
        const skip = (page - 1) * limit;
        const total = await this.count(filter);

        const data = await this.findMany(filter, {
            ...options,
            skip,
            limit
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Abstract methods for mapping
    protected abstract mapFromMongo(doc: any): T;
    protected mapToMongo(data: any): any {
        // Default implementation - override if needed
        if (data && typeof data === 'object') {
            if (data.id) {
                delete data.id;
            }

            return data;
        }
    }
}