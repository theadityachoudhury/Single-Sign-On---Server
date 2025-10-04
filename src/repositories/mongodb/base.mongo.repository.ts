import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { IBaseRepository, PaginatedResult, QueryOptions } from '../interfaces/base.repository.interface';

/**
 * Base MongoDB repository implementing common CRUD operations using Mongoose.
 * Uses lean queries by default for better performance.
 * 
 * @template T - The entity type (plain object)
 * @template CreateDTO - DTO for creation operations
 * @template UpdateDTO - DTO for update operations
 */
export abstract class BaseMongoRepository<
    T,
    CreateDTO = Partial<T>,
    UpdateDTO = Partial<T>
> implements IBaseRepository<T, CreateDTO, UpdateDTO> {

    protected readonly model: Model<any>;

    constructor(model: Model<any>) {
        this.model = model;
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).lean<T>().exec();
    }

    async findMany(filter: FilterQuery<any> = {}, options: QueryOptions = {}): Promise<T[]> {
        const query = this.model.find(filter);

        if (options.sort) query.sort(options.sort);
        if (options.skip !== undefined) query.skip(options.skip);
        if (options.limit !== undefined) query.limit(options.limit);
        if (options.select) query.select(options.select);

        return query.lean<T[]>().exec();
    }

    async create(data: CreateDTO): Promise<T> {
        const doc = await this.model.create(data);
        return doc.toObject() as T;
    }

    async update(id: string, data: UpdateDTO): Promise<T | null> {
        return this.model.findByIdAndUpdate(
            id,
            { $set: data } as UpdateQuery<any>,
            { new: true, runValidators: true }
        ).lean<T>().exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).lean().exec();
        return result !== null;
    }

    async count(filter: FilterQuery<any> = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    async exists(id: string): Promise<boolean> {
        const result = await this.model.exists({ _id: id });
        return result !== null;
    }

    protected async findWithPagination(
        filter: FilterQuery<any> = {},
        page: number,
        limit: number,
        options: QueryOptions = {}
    ): Promise<PaginatedResult<T>> {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.findMany(filter, { ...options, skip, limit }),
            this.count(filter)
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}