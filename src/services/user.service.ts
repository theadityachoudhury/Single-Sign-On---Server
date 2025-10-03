//disable eslint for this file
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { PaginatedResult } from '@/repositories/interfaces/base.repository.interface';
import { IUserRepository } from '@/repositories/interfaces/user.repository.interface';
import { CreateUserDTO, UpdateUserDTO } from '@/types/dtos/user.dto';
import { User, UserStatus } from '@/types/entities/user.entity';
import bcrypt from 'bcrypt';
import { container } from '../container/dependency-injection';

export class UserService {
    constructor(private userRepository: IUserRepository) { }

    async createUser(userData: CreateUserDTO): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create user
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            email: userData.email.toLowerCase()
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }

    async getUserById(id: string): Promise<User | null> {
        const user = await this.userRepository.findById(id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
        return null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
        return null;
    }

    async updateUser(id: string, updateData: UpdateUserDTO): Promise<User | null> {
        const user = await this.userRepository.update(id, updateData);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }
        return null;
    }

    async deleteUser(id: string): Promise<boolean> {
        return await this.userRepository.delete(id);
    }

    async getActiveUsers(limit?: number): Promise<User[]> {
        const users = await this.userRepository.findActiveUsers({ limit });
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }

    async getUsersWithPagination(
        page: number = 1,
        limit: number = 10,
        filter: Record<string, any> = {}
    ): Promise<PaginatedResult<User>> {
        const result = await this.userRepository.findUsersWithPagination(page, limit, filter);

        // Remove passwords from all users
        const usersWithoutPasswords = result.data.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });

        return {
            ...result,
            data: usersWithoutPasswords
        };
    }

    async promoteToVIP(userId: string): Promise<User | null> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Business logic for VIP promotion
        if (user.status === UserStatus.VIP) {
            throw new Error('User is already VIP');
        }

        return await this.updateUser(userId, { status: UserStatus.VIP });
    }

    async getUserStats() {
        return await this.userRepository.getUserStats();
    }

    async findNearbyUsers(lat: number, lng: number, radiusKm: number): Promise<User[]> {
        const users = await this.userRepository.findUsersByLocation(lat, lng, radiusKm);
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }

    // Authentication helper (you might move this to AuthService)
    async validatePassword(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.password) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        }

        return null;
    }
}

container.register<UserService>('userService', () => new UserService(container.resolve<IUserRepository>('userRepository')))
