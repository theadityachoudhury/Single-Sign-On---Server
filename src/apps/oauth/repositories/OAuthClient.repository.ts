import { type CreateOAuthClientDTO, IOAuthClient } from '@/types/OAuth/OAuthClients.type.js';
import { ClientSession } from 'mongoose';
import { OAuthClientsModel } from '@/apps/oauth/models/OAuthClients.js';
import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import MongooseUtils from '@/Utils/Mongoose.js';

export default class OAuthClientRepository {
    async createClient(
        data: CreateOAuthClientDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<IOAuthClient>> {
        try {
            const client = new OAuthClientsModel({
                ...data,
            });

            if (session) {
                client.$session(session);
            }

            await client.save();
            return successResponse<IOAuthClient>(
                MongooseUtils.toPlainObject<IOAuthClient>(client),
                'OAuth client created successfully'
            );
        } catch (error) {
            console.log(error);
            return errorResponse<IOAuthClient>(error, 'Failed to create OAuth client');
        }
    }
}
