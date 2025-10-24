export enum ClientAuthMethods {
    CLIENT_SECRET_BASIC = 'client_secret_basic',
    CLIENT_SECRET_POST = 'client_secret_post',
    CLIENT_SECRET_JWT = 'client_secret_jwt',
    PRIVATE_KEY_JWT = 'private_key_jwt',
    NONE = 'none',
}

export interface IClientAuthMethod {
    id: string;
    client_id: string;
    auth_method: ClientAuthMethods;
    createdAt: Date;
    updatedAt: Date;
}

export interface AssignAuthMethodDTO {
    clientId: string;
    authMethod: ClientAuthMethods;
}
