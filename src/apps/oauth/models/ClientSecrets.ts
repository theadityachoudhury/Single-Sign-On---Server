import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

const ClientSecretSchema = new Schema(
    {
        clientId: {
            type: String,
            required: true,
        },
        secretHash: {
            type: String,
            required: true,
        },
        secretHint: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        expiresAt: {
            type: Date,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const ClientSecretModel = db.oAuthDB.model('ClientSecrets', ClientSecretSchema);
export default ClientSecretModel;
