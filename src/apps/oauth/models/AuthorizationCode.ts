import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

const AuthorizationCodeSchema: Schema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        clientId: {
            type: Buffer,
            required: true,
            ref: 'OAuthClients',
        },
        userId: {
            type: Buffer,
            required: true,
        },
        redirectURI: {
            type: String,
            required: true,
        },
        scope: {
            type: Buffer,
            required: true,
            ref: 'OAuthScopes',
        },
        codeChallenge: {
            type: String,
            required: false,
        },
        codeChallengeMethod: {
            type: String,
            enum: ['plain', 'S256'],
            required: false,
        },
        nonce: {
            type: String,
            required: false,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        used_at: {
            type: Date,
            required: false,
            default: null,
        },
    },
    { timestamps: true }
);

export const AuthorizationCodeModel = db.oAuthDB.model(
    'AuthorizationCodes',
    AuthorizationCodeSchema
);
