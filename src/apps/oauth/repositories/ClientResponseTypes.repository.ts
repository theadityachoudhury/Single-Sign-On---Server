import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import { ClientSession } from 'mongoose';
import IOAuthClientResponseTypes, {
    CreateOAuthClientResponseDTO,
    RemoveOAuthClientResponseDTO,
} from '@/apps/oauth/types/ClientResponse.type.js';
import { ClientResponseTypesModel } from '@/apps/oauth/models/ClientResponseTypes.js';
import { logger } from '@/Logger/index.js';
import MongooseUtils from '@/Utils/Mongoose.js';

export default class ClientResponseTypesRepository {
    async assignResponseTypeToClient(
        data: CreateOAuthClientResponseDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<IOAuthClientResponseTypes>> {
        try {
            const responseType = new ClientResponseTypesModel({
                ...data,
            });

            if (session) {
                responseType.$session(session);
            }

            await responseType.save();

            return successResponse<IOAuthClientResponseTypes>(
                MongooseUtils.toPlainObject<IOAuthClientResponseTypes>(responseType),
                'OAuth client response type assigned successfully'
            );
        } catch (error) {
            logger.error('Error assigning client response type:', error);
            return errorResponse<IOAuthClientResponseTypes>(
                error,
                'Failed to assign OAuth client response type'
            );
        }
    }

    async removeResponseTypeFromClient(
        data: RemoveOAuthClientResponseDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<boolean>> {
        try {
            await ClientResponseTypesModel.findOneAndDelete(
                {
                    ...data,
                },
                session ? { session } : {}
            );

            return successResponse<boolean>(
                true,
                'OAuth client response type removed successfully'
            );
        } catch (error) {
            logger.error('Error removing client response type', error);
            return errorResponse<boolean>(error, 'Failed to remove client response type');
        }
    }

    async getClientResponseTypes(
        clientId: string
    ): Promise<FunctionResponseType<IOAuthClientResponseTypes[]>> {
        try {
            const clientResponseTypes = await ClientResponseTypesModel.find({
                clientId,
            });

            return successResponse<IOAuthClientResponseTypes[]>(
                MongooseUtils.toPlainObjectArray<IOAuthClientResponseTypes>(clientResponseTypes),
                'OAuth Client response types fetched successfully'
            );
        } catch (error) {
            logger.error('Error fetching client response types.', error);
            return errorResponse<IOAuthClientResponseTypes[]>(
                error,
                'Failed to fetch client response types.'
            );
        }
    }
}
