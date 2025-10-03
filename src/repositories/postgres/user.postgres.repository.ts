import { CreateUserDTO, UpdateUserDTO } from '@/types/dtos/user.dto';
import { User, UserProfile, UserStatus } from '@/types/entities/user.entity';
import { PaginatedResult, QueryOptions } from '../interfaces/base.repository.interface';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { BasePostgresRepository } from './base.postgres.repository';

export class UserPostgresRepository extends BasePostgresRepository<User, CreateUserDTO, UpdateUserDTO>
    implements IUserRepository {

    constructor() {
        super('users');
    }

    protected mapFromPostgres(row: any): User {
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            password: row.password,
            status: row.status,
            role: row.role,
            profileId: row.profile_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastLoginAt: row.last_login_at
        };
    }

    protected mapToPostgres(data: any): any {
        const { profileId, createdAt, lastLoginAt, ...rest } = data;
        return {
            ...rest,
            profile_id: profileId,
            last_login_at: lastLoginAt,
            created_at: createdAt || new Date(),
            updated_at: new Date()
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.pool.query(query, [email.toLowerCase()]);

        return result.rows[0] ? this.mapFromPostgres(result.rows[0]) : null;
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
        const query = `
      INSERT INTO user_profiles (user_id, first_name, last_name, avatar, bio, phone, address, preferences)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

        const values = [
            profileData.userId,
            profileData.firstName,
            profileData.lastName,
            profileData.avatar,
            profileData.bio,
            profileData.phone,
            JSON.stringify(profileData.address),
            JSON.stringify(profileData.preferences)
        ];

        const result = await this.pool.query(query, values);
        return this.mapProfileFromPostgres(result.rows[0]);
    }

    async findProfileByUserId(userId: string): Promise<UserProfile | null> {
        const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
        const result = await this.pool.query(query, [userId]);

        return result.rows[0] ? this.mapProfileFromPostgres(result.rows[0]) : null;
    }

    async updateProfile(userId: string, profileData: any): Promise<UserProfile | null> {
        const query = `
      UPDATE user_profiles 
      SET first_name = $2, last_name = $3, avatar = $4, bio = $5, phone = $6, 
          address = $7, preferences = $8, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;

        const values = [
            userId,
            profileData.firstName,
            profileData.lastName,
            profileData.avatar,
            profileData.bio,
            profileData.phone,
            JSON.stringify(profileData.address),
            JSON.stringify(profileData.preferences)
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0] ? this.mapProfileFromPostgres(result.rows[0]) : null;
    }

    async findUsersByLocation(lat: number, lng: number, radiusKm: number): Promise<User[]> {
        // PostgreSQL with PostGIS extension
        const query = `
      SELECT u.* FROM users u
      INNER JOIN user_profiles p ON u.id = p.user_id
      WHERE ST_DWithin(
        (p.address->>'location')::geography,
        ST_MakePoint($1, $2)::geography,
        $3
      )
    `;

        const result = await this.pool.query(query, [lng, lat, radiusKm * 1000]);
        return result.rows.map(row => this.mapFromPostgres(row));
    }

    async findRecentActiveUsers(days: number, limit: number = 100): Promise<User[]> {
        const query = `
      SELECT * FROM users 
      WHERE last_login_at >= NOW() - INTERVAL '${days} days'
        AND status = $1
      ORDER BY last_login_at DESC 
      LIMIT $2
    `;

        const result = await this.pool.query(query, [UserStatus.ACTIVE, limit]);
        return result.rows.map(row => this.mapFromPostgres(row));
    }

    async getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        vip: number;
    }> {
        const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
        COUNT(*) FILTER (WHERE status = 'INACTIVE') as inactive,
        COUNT(*) FILTER (WHERE status = 'VIP') as vip
      FROM users
    `;

        const result = await this.pool.query(query);
        const row = result.rows[0];

        return {
            total: parseInt(row.total),
            active: parseInt(row.active),
            inactive: parseInt(row.inactive),
            vip: parseInt(row.vip)
        };
    }

    private mapProfileFromPostgres(row: any): UserProfile {
        return {
            id: row.id,
            userId: row.user_id,
            firstName: row.first_name,
            lastName: row.last_name,
            avatar: row.avatar,
            bio: row.bio,
            phone: row.phone,
            address: row.address ? JSON.parse(row.address) : null,
            preferences: row.preferences ? JSON.parse(row.preferences) : {}
        };
    }
}