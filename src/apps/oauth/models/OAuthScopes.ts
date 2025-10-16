import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

const OAuthScopesSchema: Schema = new Schema(
    {
        scope_name: {
            type: String,
            required: true,
            unique: true,
        },
        display_name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        is_default: {
            type: Boolean,
            default: false,
            required: false,
        },
        is_system_scope: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    { timestamps: true }
);

export const OAuthScopesModel = db.oAuthDB.model('OAuthScopes', OAuthScopesSchema);
