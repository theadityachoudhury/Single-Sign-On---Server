// Common type aliases and utility types

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
}

// Pagination types
export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Auth types
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
