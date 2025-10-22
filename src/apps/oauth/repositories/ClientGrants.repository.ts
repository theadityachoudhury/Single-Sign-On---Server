import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import { ClientSession } from 'mongoose';
import IOAuthClientGrants, {
    CreateOAuthClientGrantDTO,
    RemoveOAuthClientGrantDTO,
} from '@/types/OAuth/ClientGrants.type.js';
import { ClientGrantTypesModel } from '@/apps/oauth/models/ClientGrants.js';
import { logger } from '@/Logger/index.js';
import MongooseUtils from '@/Utils/Mongoose.js';

export default class ClientGrantsRepository {
    async assignGrantToClient(
        data: CreateOAuthClientGrantDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<IOAuthClientGrants>> {
        try {
            const grant = new ClientGrantTypesModel({
                ...data,
            });

            if (session) {
                grant.$session(session);
            }

            await grant.save();

            return successResponse<IOAuthClientGrants>(
                MongooseUtils.toPlainObject<IOAuthClientGrants>(grant),
                'OAuth client grant assigned successfully'
            );
        } catch (error) {
            logger.error('Error assigning client grant:', error);
            return errorResponse<IOAuthClientGrants>(error, 'Failed to assign OAuth client grants');
        }
    }

    async removeGrantToClientByGrantId(
        id: string,
        session?: ClientSession
    ): Promise<FunctionResponseType<boolean>> {
        try {
            await ClientGrantTypesModel.findByIdAndDelete(id, session ? { session } : {});
            return successResponse<boolean>(true, 'OAuth client grant removed successfully');
        } catch (error) {
            logger.error('Error removing client grant', error);
            return errorResponse<boolean>(error, 'Failed to remove client grant');
        }
    }

    async removeGrantToClientByClientIdAndGrantName(
        data: RemoveOAuthClientGrantDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<boolean>> {
        try {
            await ClientGrantTypesModel.findOneAndDelete(
                {
                    ...data,
                },
                session ? { session } : {}
            );

            return successResponse<boolean>(true, 'OAuth client grant removed successfully');
        } catch (error) {
            logger.error('Error removing client grant', error);
            return errorResponse<boolean>(error, 'Failed to remove client grant');
        }
    }

    async getClientGrants(clientId: string): Promise<FunctionResponseType<IOAuthClientGrants[]>> {
        try {
            const clientGrants = await ClientGrantTypesModel.find({
                clientId,
            });

            return successResponse<IOAuthClientGrants[]>(
                MongooseUtils.toPlainObjectArray<IOAuthClientGrants>(clientGrants),
                'OAuth Client grant fetched successfully'
            );
        } catch (error) {
            logger.error('Error fetching client grants.', error);
            return errorResponse<IOAuthClientGrants[]>(error, 'Failed to fetch client grants.');
        }
    }
}
