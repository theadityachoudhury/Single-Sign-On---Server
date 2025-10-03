// This is a demo code snippet for defining user-related types in a TypeScript application.
//Please ensure to adjust the types according to your application's requirements.
// src/types/entities/user.entity.ts

// What this file mean
// This file defines the structure of user-related entities in the application.
// It includes the User entity, UserStatus, UserRole, UserProfile, Address, and UserPreferences types.
// It is used to ensure type safety and consistency across the application when dealing with user data.
// It is part of the src/types/entities directory, which contains various entity definitions.
// It is important to keep this file updated as the application evolves to reflect any changes in user
// management requirements.

//What are entities
// Entities are objects that represent a distinct concept or item in the application.
// They are typically used to model the data structure and behavior of these concepts.
// In this case, the User entity represents a user in the system, including their profile and
// preferences. Entities help in organizing the code and ensuring that data is handled consistently.

export interface User {
    id: string;
    email: string;
    name: string;
    password?: string; // Optional in responses
    status: UserStatus;
    role: UserRole;
    profileId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    VIP = 'VIP'
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR'
}

export interface UserProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: Address;
    preferences: UserPreferences;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface UserPreferences {
    notifications: boolean;
    newsletter: boolean;
    theme: 'LIGHT' | 'DARK';
}