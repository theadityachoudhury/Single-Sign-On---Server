import { CreateUserDTO, UpdateUserDTO } from '@/types/dtos/user.dto';
import { User, UserProfile, UserStatus } from '@/types/entities/user.entity';
import { PaginatedResult, QueryOptions } from '../interfaces/base.repository.interface';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { BaseMongoRepository } from './base.mongo.repository';

export class UserMongoRepository extends BaseMongoRepository<User, CreateUserDTO, UpdateUserDTO>
    implements IUserRepository {

    private profileCollection = this.db.collection('user_profiles');

    constructor() {
        super('users');
    }

    protected mapFromMongo(doc: any): User {
        return {
            id: doc._id.toString(),
            email: doc.email,
            name: doc.name,
            password: doc.password,
            status: doc.status,
            role: doc.role,
            profileId: doc.profileId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            lastLoginAt: doc.lastLoginAt
        };
    }

    protected mapToMongo(data: any): any {
        if (data && typeof data === 'object') {
            if (data.id) {
                delete data.id; // Remove id field if present
            }
            // Ensure createdAt and updatedAt are set
            data.createdAt = data.createdAt || new Date();
            data.updatedAt = new Date(); // Always update updatedAt to current time
        }

        return {
            ...data,
            createdAt: data.createdAt || new Date(),
            updatedAt: new Date()
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const doc = await this.collection.findOne({ email: email.toLowerCase() });
        return doc ? this.mapFromMongo(doc) : null;
    }

    async findActiveUsers(options: QueryOptions = {}): Promise<User[]> {
        return await this.findMany({ status: UserStatus.ACTIVE }, options);
    }

    async findUsersByRole(role: string): Promise<User[]> {
        return await this.findMany({ role });
    }

    async findUsersWithPagination(
        page: number,
        limit: number,
        filter: Record<string, any> = {}
    ): Promise<PaginatedResult<User>> {
        return await this.findWithPagination(filter, page, limit);
    }

    async createProfile(profileData: any): Promise<UserProfile> {
        const docToInsert = {
            ...profileData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.profileCollection.insertOne(docToInsert);

        return {
            id: result.insertedId.toString(),
            ...profileData,
            createdAt: docToInsert.createdAt,
            updatedAt: docToInsert.updatedAt
        } as UserProfile;
    }

    async findProfileByUserId(userId: string): Promise<UserProfile | null> {
        const doc = await this.profileCollection.findOne({ userId });
        return doc ? this.mapProfileFromMongo(doc) : null;
    }

    async updateProfile(userId: string, profileData: any): Promise<UserProfile | null> {
        const result = await this.profileCollection.findOneAndUpdate(
            { userId },
            { $set: { ...profileData, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        return result ? this.mapProfileFromMongo(result) : null;
    }

    async findUsersByLocation(lat: number, lng: number, radiusKm: number): Promise<User[]> {
        // MongoDB geospatial query
        const pipeline = [
            {
                $lookup: {
                    from: 'user_profiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            {
                $match: {
                    'profile.address.location': {
                        $near: {
                            $geometry: { type: 'Point', coordinates: [lng, lat] },
                            $maxDistance: radiusKm * 1000 // Convert km to meters
                        }
                    }
                }
            }
        ];

        const docs = await this.collection.aggregate(pipeline).toArray();
        return docs.map(doc => this.mapFromMongo(doc));
    }

    async findRecentActiveUsers(days: number, limit: number = 100): Promise<User[]> {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return await this.findMany(
            {
                lastLoginAt: { $gte: cutoffDate },
                status: UserStatus.ACTIVE
            },
            {
                sort: { lastLoginAt: -1 },
                limit
            }
        );
    }

    async getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        vip: number;
    }> {
        const pipeline = [
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ];

        const results = await this.collection.aggregate(pipeline).toArray();

        const stats = {
            total: 0,
            active: 0,
            inactive: 0,
            vip: 0
        };

        results.forEach(result => {
            stats.total += result.count;
            switch (result._id) {
                case UserStatus.ACTIVE:
                    stats.active = result.count;
                    break;
                case UserStatus.INACTIVE:
                    stats.inactive = result.count;
                    break;
                case UserStatus.VIP:
                    stats.vip = result.count;
                    break;
            }
        });

        return stats;
    }

    private mapProfileFromMongo(doc: any): UserProfile {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            firstName: doc.firstName,
            lastName: doc.lastName,
            avatar: doc.avatar,
            bio: doc.bio,
            phone: doc.phone,
            address: doc.address,
            preferences: doc.preferences
        };
    }
}