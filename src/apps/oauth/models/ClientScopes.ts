import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

const ClientScopesSchema: Schema = new Schema(
    {
        clientId: {
            type: Buffer,
            required: true,
            ref: 'OAuthClients',
        },
        scope_name: {
            type: String,
            required: true,
            ref: 'OAuthScopes',
            unique: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { timestamps: true }
);

export const ClientScopesModel = db.oAuthDB.model('ClientScopes', ClientScopesSchema);
