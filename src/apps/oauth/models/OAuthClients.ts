import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';
import { v4 } from 'uuid';
import { ClientType, ApplicationType } from '@/types/OAuth/OAuthClients.type.js';

const OAuthClientsSchema: Schema = new Schema(
    {
        _id: {
            type: String,
            default: v4,
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
            enum: ClientType,
            default: ClientType.PUBLIC,
            required: true,
        },
        applicationType: {
            type: String,
            enum: ApplicationType,
            default: ApplicationType.WEB,
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
        accessTokenLifetime: {
            type: Number,
            default: 3600, // 1 hour in seconds
        },
        refreshTokenLifetime: {
            type: Number,
            default: 1209600, // 14 days in seconds
        },
        idTokenLifetime: {
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
        delete ret.id;
    },
});

OAuthClientsSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
        delete ret.id;
    },
});

OAuthClientsSchema.index({ isActive: 1 });

export const OAuthClientsModel = db.oAuthDB.model('OAuthClients', OAuthClientsSchema);
