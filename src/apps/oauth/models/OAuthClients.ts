import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';
import { v4 } from 'uuid';

enum clientType {
    CONFIDENTIAL = 'confidential',
    PUBLIC = 'public',
}

enum applicationType {
    WEB = 'web',
    NATIVE = 'native',
    SPA = 'spa',
}

const OAuthClientsSchema: Schema = new Schema(
    {
        _id: {
            type: Buffer,
            default: () => v4(),
            get: (v: Buffer) => {
                const match = v.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
                return match ? match.slice(1).join('-') : '';
            },
        },
        clientName: {
            type: String,
            required: true,
        },
        clientSecretHash: {
            type: String,
            required: true,
        },
        clientDescription: {
            type: String,
            required: false,
        },
        clientType: {
            type: String,
            enum: clientType,
            default: clientType.PUBLIC,
            required: true,
        },
        applicationType: {
            type: String,
            enum: applicationType,
            default: applicationType.WEB,
            required: true,
        },
        clientURI: {
            type: String,
            required: false,
        },
        logoURI: {
            type: String,
            required: false,
        },
        policyURI: {
            type: String,
            required: false,
        },
        tosURI: {
            type: String,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        access_token_lifetime: {
            type: Number,
            default: 3600, // 1 hour in seconds
        },
        refresh_token_lifetime: {
            type: Number,
            default: 1209600, // 14 days in seconds
        },
        id_token_lifetime: {
            type: Number,
            default: 120, // 2 minutes in seconds
        },
    },
    { timestamps: true }
);

OAuthClientsSchema.virtual('clientId').get(function () {
    return this._id;
});

OAuthClientsSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    },
});

OAuthClientsSchema.set('toObject', { virtuals: true });

OAuthClientsSchema.index({ is_active: 1 });

export const OAuthClientsModel = db.oAuthDB.model('OAuthClients', OAuthClientsSchema);
