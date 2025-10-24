import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';
import { ClientAuthMethods } from '@/types/OAuth/ClientAuthMethods.type.js';

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
