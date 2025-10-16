import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

enum clientGrantType {
    AUTHORIZATION_CODE = 'authorization',
    IMPLICIT = 'implicit',
    PASSWORD = 'password',
    CLIENT_CREDENTIALS = 'client_credentials',
    REFRESH_TOKEN = 'refresh_token',
    DEVICE_CODE = 'urn:ietf:params:oauth:grant-type:device_code',
    JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer',
}

const ClientGrantTypes: Schema = new Schema(
    {
        clientId: {
            type: Buffer,
            required: true,
            ref: 'OAuthClients',
        },
        grantType: {
            type: String,
            required: true,
            enum: clientGrantType,
        },
    },
    { timestamps: true }
);

export const ClientGrantTypesModel = db.oAuthDB.model('ClientGrantTypes', ClientGrantTypes);
