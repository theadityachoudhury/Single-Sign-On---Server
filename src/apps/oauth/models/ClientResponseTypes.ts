import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

enum responseType {
    CODE = 'code',
    TOKEN = 'token',
    ID_TOKEN = 'id_token',
    CODE_TOKEN = 'code token',
    CODE_ID_TOKEN = 'code id_token',
    TOKEN_ID_TOKEN = 'token id_token',
    CODE_TOKEN_ID_TOKEN = 'code token id_token',
}

const ClientResponseTypes: Schema = new Schema(
    {
        clientId: {
            type: Buffer,
            required: true,
            ref: 'OAuthClients',
        },
        responseType: {
            type: String,
            required: true,
            enum: responseType,
        },
    },
    { timestamps: true }
);

export const ClientResponseTypesModel = db.oAuthDB.model(
    'ClientResponseTypes',
    ClientResponseTypes
);
