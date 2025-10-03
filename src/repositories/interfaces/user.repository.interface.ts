import { CreateUserDTO, UpdateUserDTO } from '@/types/dtos/user.dto';
import { User, UserProfile } from '@/types/entities/user.entity';
import { IBaseRepository, PaginatedResult, QueryOptions } from './base.repository.interface';

export interface IUserRepository extends IBaseRepository<User, CreateUserDTO, UpdateUserDTO> {
    // User-specific methods
    findByEmail(email: string): Promise<User | null>;
    findActiveUsers(options?: QueryOptions): Promise<User[]>;
    findUsersByRole(role: string): Promise<User[]>;
    findUsersWithPagination(page: number, limit: number, filter?: Record<string, any>): Promise<PaginatedResult<User>>;

    // Profile methods
    createProfile(profileData: any): Promise<UserProfile>;
    findProfileByUserId(userId: string): Promise<UserProfile | null>;
    updateProfile(userId: string, profileData: any): Promise<UserProfile | null>;

    // Advanced queries
    findUsersByLocation(lat: number, lng: number, radiusKm: number): Promise<User[]>;
    findRecentActiveUsers(days: number, limit?: number): Promise<User[]>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        vip: number;
    }>;
}