import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

enum uriType {
    REDIRECT = 'redirect',
    POST_LOGOUT = 'post_logout',
}

const ClientRedirectURIsSchema: Schema = new Schema(
    {
        clientId: {
            type: String,
            required: true,
            ref: 'OAuthClients',
        },
        redirectURI: {
            type: String,
            required: true,
        },
        uri_type: {
            type: String,
            enum: uriType,
            default: uriType.REDIRECT,
            required: true,
        },
        is_default: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { timestamps: true }
);

ClientRedirectURIsSchema.index({ clientId: 1, uriType: 1 });

export const ClientRedirectURIsModel = db.oAuthDB.model(
    'ClientRedirectURIs',
    ClientRedirectURIsSchema
);
