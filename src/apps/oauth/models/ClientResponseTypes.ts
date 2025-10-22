import { db } from '@/core/DB/index.js';
import { Schema } from 'mongoose';
import { responseType } from '@/types/OAuth/ClientResponse.type.js';

const ClientResponseTypes: Schema = new Schema(
    {
        clientId: {
            type: String,
            required: true,
            ref: 'OAuthClients',
        },
        responseType: {
            type: String,
            required: true,
            enum: responseType,
        },
    },
    { timestamps: true }
);

ClientResponseTypes.index({ clientId: 1, responseType: 1 }, { unique: true });
ClientResponseTypes.set('toObject', {
    versionKey: false,
    transform: function (_, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

export const ClientResponseTypesModel = db.oAuthDB.model(
    'ClientResponseTypes',
    ClientResponseTypes
);
