import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';

const DeviceCodesSchema: Schema = new Schema(
    {
        device_code: {
            type: String,
            required: true,
            unique: true,
        },
        user_code: {
            type: String,
            required: true,
            unique: true,
        },
        client_id: {
            type: String,
            required: true,
            ref: 'OAuthClients',
        },
        scope: {
            type: [String],
            required: true,
            ref: 'OAuthScopes',
        },
        expires_at: {
            type: Date,
            required: true,
        },
        interval: {
            type: Number,
            required: false,
            default: 5,
        },
        user_id: {
            type: String,
            required: false,
            default: null,
        },
        authorized_at: {
            type: Date,
            required: false,
            default: null,
        },
    },
    { timestamps: true }
);

DeviceCodesSchema.index({ device_code: 1 });
DeviceCodesSchema.index({ user_code: 1 });
DeviceCodesSchema.index({ client_id: 1 });
DeviceCodesSchema.index({ expires_at: 1 });

DeviceCodesSchema.set('toObject', {
    versionKey: false,
    transform: function (_, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

export const DeviceCodesModel = db.oAuthDB.model('DeviceCodes', DeviceCodesSchema);
