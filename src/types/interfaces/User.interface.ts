export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthResponse {
    success: boolean;
    token: string;
    user: Omit<IUser, 'password'>;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}
