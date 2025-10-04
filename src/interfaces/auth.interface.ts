/**
 * AUTH INTERFACES
 * 
 * Interfaces for authentication and authorization
 */

import { IUser } from './user.interface';

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IAuthResponse {
    user: Omit<IUser, 'emailVerified'>;
    tokens: IAuthTokens;
}

export interface IJwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface IAuthService {
    register(email: string, password: string, name: string): Promise<IAuthResponse>;
    login(email: string, password: string): Promise<IAuthResponse>;
    refreshToken(refreshToken: string): Promise<IAuthTokens>;
    logout(userId: string, refreshToken: string): Promise<void>;
    verifyToken(token: string): Promise<IJwtPayload>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface ITokenService {
    generateAccessToken(payload: IJwtPayload): string;
    generateRefreshToken(payload: IJwtPayload): string;
    verifyAccessToken(token: string): IJwtPayload;
    verifyRefreshToken(token: string): IJwtPayload;
}
