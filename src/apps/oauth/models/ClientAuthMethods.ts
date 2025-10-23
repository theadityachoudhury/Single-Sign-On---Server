import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

enum ClientAuthMethods {
    CLIENT_SECRET_BASIC = 'client_secret_basic',
    CLIENT_SECRET_POST = 'client_secret_post',
    CLIENT_SECRET_JWT = 'client_secret_jwt',
    PRIVATE_KEY_JWT = 'private_key_jwt',
    NONE = 'none',
}

const ClientAuthMethodsSchema: Schema = new Schema(
    {
        client_id: {
            type: String,
            required: true,
            ref: 'OAuthClients',
        },
        auth_method: {
            type: String,
            required: true,
            enum: ClientAuthMethods,
        },
    },
    { timestamps: true }
);

ClientAuthMethodsSchema.index({ client_id: 1, auth_method: 1 }, { unique: true });
ClientAuthMethodsSchema.set('toObject', {
    versionKey: false,
    transform: function (_, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

export const ClientAuthMethodsModel = db.oAuthDB.model(
    'ClientAuthMethods',
    ClientAuthMethodsSchema
);
