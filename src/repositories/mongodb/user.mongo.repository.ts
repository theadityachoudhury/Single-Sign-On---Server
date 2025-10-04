import { UserModel, UserProfileModel } from '@/models/user.model';
import { CreateUserDTO, UpdateUserDTO } from '@/types/dtos/user.dto';
import { User, UserProfile, UserStatus } from '@/types/entities/user.entity';
import { FilterQuery } from 'mongoose';
import { PaginatedResult, QueryOptions } from '../interfaces/base.repository.interface';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { BaseMongoRepository } from './base.mongo.repository';

export class UserMongoRepository extends BaseMongoRepository<User, CreateUserDTO, UpdateUserDTO>
    implements IUserRepository {

    constructor() {
        super(UserModel);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.model.findOne({ email: email.toLowerCase() })
            .lean<User>()
            .exec();
    }

    async findActiveUsers(options: QueryOptions = {}): Promise<User[]> {
        return this.findMany({ status: UserStatus.ACTIVE }, options);
    }

    async findUsersByRole(role: string): Promise<User[]> {
        return this.findMany({ role });
    }

    async findUsersWithPagination(
        page: number,
        limit: number,
        filter: FilterQuery<any> = {}
    ): Promise<PaginatedResult<User>> {
        return this.findWithPagination(filter, page, limit);
    }

    async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        const doc = await UserProfileModel.create(profileData);
        return doc.toObject() as UserProfile;
    }

    async findProfileByUserId(userId: string): Promise<UserProfile | null> {
        return UserProfileModel.findOne({ userId })
            .lean<UserProfile>()
            .exec();
    }

    async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
        return UserProfileModel.findOneAndUpdate(
            { userId },
            { $set: profileData },
            { new: true, runValidators: true }
        ).lean<UserProfile>().exec();
    }

    async findUsersByLocation(lat: number, lng: number, radiusKm: number): Promise<User[]> {
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

        return this.model.aggregate<User>(pipeline).exec();
    }

    async findRecentActiveUsers(days: number, limit = 100): Promise<User[]> {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return this.findMany(
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
        const results = await this.model.aggregate<{ _id: UserStatus; count: number }>([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).exec();

        const stats = {
            total: 0,
            active: 0,
            inactive: 0,
            vip: 0
        };

        results.forEach((result) => {
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
}