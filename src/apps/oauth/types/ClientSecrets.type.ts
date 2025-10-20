export interface IClientSecret {
    _id: string;
    clientId: string;
    secretHash: string;
    secretHint: string;
    description?: string;
    expiresAt?: Date;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateClientSecretDTO = Omit<IClientSecret, '_id' | 'createdAt' | 'updatedAt'>;
