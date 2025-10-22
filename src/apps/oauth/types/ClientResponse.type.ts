export enum responseType {
    CODE = 'code',
    TOKEN = 'token',
    ID_TOKEN = 'id_token',
    CODE_TOKEN = 'code token',
    CODE_ID_TOKEN = 'code id_token',
    TOKEN_ID_TOKEN = 'token id_token',
    CODE_TOKEN_ID_TOKEN = 'code token id_token',
}

export default interface IOAuthClientResponseTypes {
    clientId: string;
    responseType: responseType;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateOAuthClientResponseDTO = Omit<
    IOAuthClientResponseTypes,
    'createdAt' | 'updatedAt'
>;

export type RemoveOAuthClientResponseDTO = Omit<
    IOAuthClientResponseTypes,
    'createdAt' | 'updatedAt'
>;
