import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

const UserConsentSchema: Schema = new Schema(
    {
        user_id: {
            type: Buffer,
            required: true,
        },
        client_id: {
            type: Buffer,
            required: true,
            ref: 'OAuthClient',
        },
        scopes_granted: {
            type: [String],
            required: true,
        },
        consent_date: {
            type: Date,
            default: Date.now,
        },
        expires_at: {
            type: Date,
            required: false,
        },
        is_persistent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const UserConsentModel = db.oAuthDB.model('UserConsent', UserConsentSchema);
