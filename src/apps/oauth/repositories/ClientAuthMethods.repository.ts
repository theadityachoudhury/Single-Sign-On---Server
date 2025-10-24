import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import { logger } from '@/Logger/index.js';
import { ClientSession } from 'mongoose';
import { ClientAuthMethodsModel } from '@/apps/oauth/models/ClientAuthMethods.js';
import MongooseUtils from '@/Utils/Mongoose.js';
import {
    AssignAuthMethodDTO,
    ClientAuthMethods,
    IClientAuthMethod,
} from '@/types/OAuth/ClientAuthMethods.type.js';

export default class ClientAuthMethodsRepository {
    /**
     * Assign an authentication method to a client
     */
    async assignAuthMethodToClient(
        data: AssignAuthMethodDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<IClientAuthMethod>> {
        try {
            const authMethodRecord = new ClientAuthMethodsModel({
                client_id: data.clientId,
                auth_method: data.authMethod,
            });

            if (session) {
                authMethodRecord.$session(session);
            }

            await authMethodRecord.save();

            return successResponse<IClientAuthMethod>(
                MongooseUtils.toPlainObject<IClientAuthMethod>(authMethodRecord),
                `Auth method '${data.authMethod}' assigned to client successfully`
            );
        } catch (error) {
            logger.error('Error assigning auth method to client:', error);
            return errorResponse<IClientAuthMethod>(
                error,
                'Failed to assign auth method to client'
            );
        }
    }

    /**
     * Remove a specific authentication method from a client
     */
    async removeAuthMethodFromClient(
        data: AssignAuthMethodDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<null>> {
        try {
            const options = session ? { session } : {};
            const result = await ClientAuthMethodsModel.deleteOne(
                {
                    client_id: data.clientId,
                    auth_method: data.authMethod,
                },
                options
            );

            if (result.deletedCount === 0) {
                return errorResponse<null>(
                    null,
                    `Auth method '${data.authMethod}' not found for client`
                );
            }

            return successResponse<null>(
                null,
                `Auth method '${data.authMethod}' removed from client successfully`
            );
        } catch (error) {
            logger.error('Error removing auth method from client:', error);
            return errorResponse<null>(error, 'Failed to remove auth method from client');
        }
    }

    /**
     * Get all authentication methods for a client
     */
    async getClientAuthMethods(
        clientId: string
    ): Promise<FunctionResponseType<IClientAuthMethod[]>> {
        try {
            const authMethods = await ClientAuthMethodsModel.find({
                client_id: clientId,
            });

            return successResponse<IClientAuthMethod[]>(
                MongooseUtils.toPlainObjectArray<IClientAuthMethod>(authMethods),
                'Client auth methods retrieved successfully'
            );
        } catch (error) {
            logger.error('Error retrieving client auth methods:', error);
            return errorResponse<IClientAuthMethod[]>(
                error,
                'Failed to retrieve client auth methods'
            );
        }
    }

    /**
     * Check if client has a specific authentication method
     */
    async hasAuthMethod(
        clientId: string,
        authMethod: ClientAuthMethods
    ): Promise<FunctionResponseType<boolean>> {
        try {
            const exists = await ClientAuthMethodsModel.exists({
                client_id: clientId,
                auth_method: authMethod,
            });

            return successResponse<boolean>(
                exists !== null,
                exists ? 'Auth method exists' : 'Auth method does not exist'
            );
        } catch (error) {
            logger.error('Error checking auth method:', error);
            return errorResponse<boolean>(error, 'Failed to check auth method');
        }
    }

    /**
     * Remove all authentication methods for a client (used when deleting client)
     */
    async removeAllAuthMethodsForClient(
        clientId: string,
        session?: ClientSession
    ): Promise<FunctionResponseType<null>> {
        try {
            const options = session ? { session } : {};
            await ClientAuthMethodsModel.deleteMany(
                {
                    client_id: clientId,
                },
                options
            );

            return successResponse<null>(null, 'All auth methods removed from client successfully');
        } catch (error) {
            logger.error('Error removing all auth methods from client:', error);
            return errorResponse<null>(error, 'Failed to remove all auth methods from client');
        }
    }
}
