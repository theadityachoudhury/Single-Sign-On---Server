import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';
import { clientGrantType } from '@/types/OAuth/ClientGrants.type.js';

const ClientGrantTypes: Schema = new Schema(
    {
        clientId: {
            type: String,
            required: true,
            ref: 'OAuthClients',
        },
        grantType: {
            type: String,
            required: true,
            enum: clientGrantType,
        },
    },
    { timestamps: true }
);

ClientGrantTypes.index({ clientId: 1, grantType: 1 }, { unique: true });
ClientGrantTypes.set('toObject', {
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

export const ClientGrantTypesModel = db.oAuthDB.model('ClientGrantTypes', ClientGrantTypes);
