/**
 * INTERFACES
 * 
 * Interfaces define contracts for your business logic.
 * They describe the shape of data and behavior expectations.
 * Use interfaces for:
 * - Service contracts
 * - Repository contracts
 * - API response shapes
 * - Business domain objects
 */

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
}

// Core user interface - represents the business domain
export interface IUser {
    id: string;
    email: string;
    name: string;
    status: UserStatus;
    role: UserRole;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

// User without sensitive data (for public responses)
export interface IPublicUser extends Omit<IUser, 'emailVerified'> {
    // Add any additional public fields
    profilePictureUrl?: string; // Optional field for public profile
}

// Service interfaces
export interface IUserService {
    createUser(data: any): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    updateUser(id: string, data: any): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
    verifyEmail(token: string): Promise<boolean>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
}
