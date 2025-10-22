export enum clientGrantType {
    AUTHORIZATION_CODE = 'authorization',
    IMPLICIT = 'implicit',
    PASSWORD = 'password',
    CLIENT_CREDENTIALS = 'client_credentials',
    REFRESH_TOKEN = 'refresh_token',
    DEVICE_CODE = 'urn:ietf:params:oauth:grant-type:device_code',
    JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer',
}

export default interface IOAuthClientGrants {
    clientId: string;
    grantType: clientGrantType;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateOAuthClientGrantDTO = Omit<IOAuthClientGrants, 'createdAt' | 'updatedAt'>;

export type RemoveOAuthClientGrantDTO = Omit<IOAuthClientGrants, 'createdAt' | 'updatedAt'>;
