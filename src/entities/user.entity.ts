/**
 * ENTITIES
 * 
 * Entities represent the data structure as it exists in the database.
 * They map directly to database schemas (MongoDB, PostgreSQL, etc.)
 * Use entities for:
 * - Database models
 * - ORM/ODM mappings
 * - Actual data persistence structure
 */

import { UserRole, UserStatus } from '@/interfaces/user.interface';

// User entity - matches database schema
export interface User {
    id: string;
    email: string;
    name: string;
    password: string; // Hashed password stored in DB
    status: UserStatus;
    role: UserRole;
    emailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    refreshTokens?: string[]; // Store active refresh tokens
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

// Session entity for storing user sessions
export interface Session {
    id: string;
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    createdAt: Date;
}

// For SSO - OAuth Provider entity
export interface OAuthProvider {
    id: string;
    userId: string;
    provider: 'google' | 'github' | 'microsoft' | 'facebook';
    providerId: string; // ID from the OAuth provider
    accessToken?: string;
    refreshToken?: string;
    profile: Record<string, any>; // Store provider-specific profile data
    createdAt: Date;
    updatedAt: Date;
}
