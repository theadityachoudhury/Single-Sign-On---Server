import { UserStatus, UserRole } from '../entities/user.entity';

//How is this different from entities? and how it it used?
// DTOs are specifically designed for data transfer, while entities represent the data structure
// and behavior of objects in the application. DTOs are often simpler and may not include all
// the properties of an entity, focusing instead on the data that needs to be sent or received.
// They are used to encapsulate the data for operations like creating or updating users, ensuring
// that only the necessary fields are included and validated.

export interface CreateUserDTO {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
}

export interface UpdateUserDTO {
    name?: string;
    status?: UserStatus;
    role?: UserRole;
    lastLoginAt?: Date;
}

export interface CreateUserProfileDTO {
    userId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    bio?: string;
}

export interface UpdateUserProfileDTO {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    phone?: string;
}