export enum ClientType {
    CONFIDENTIAL = 'confidential',
    PUBLIC = 'public',
}

export enum ApplicationType {
    WEB = 'web',
    NATIVE = 'native',
    SPA = 'spa',
}

export interface IOAuthClient {
    clientId: string;
    clientName: string;
    clientSecretHash: string;
    clientDescription?: string;
    clientType: ClientType;
    applicationType: ApplicationType;
    clientURI?: string;
    logoURI?: string;
    policyURI?: string;
    tosURI?: string;
    isActive: boolean;
    accessTokenLifetime: number; // in seconds
    refreshTokenLifetime: number; // in seconds
    idTokenLifetime: number; // in seconds
    createdAt: Date;
    updatedAt: Date;
}

export type CreateOAuthClientDTO = Omit<
    IOAuthClient,
    'clientId' | 'isActive' | 'createdAt' | 'updatedAt'
> &
    Partial<Pick<IOAuthClient, 'accessTokenLifetime' | 'refreshTokenLifetime' | 'idTokenLifetime'>>;
