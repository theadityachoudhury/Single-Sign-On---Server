import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import { logger } from '@/Logger/index.js';
import { ClientSession } from 'mongoose';
import ClientSecretModel from '@/apps/oauth/models/ClientSecrets.js';
import { CreateClientSecretDTO, IClientSecret } from '@/types/OAuth/ClientSecrets.type.js';
import MongooseUtils from '@/Utils/Mongoose.js';

export default class ClientSecretsRepository {
    async createClientSecret(
        data: CreateClientSecretDTO,
        session?: ClientSession,
        debug: boolean = false
    ): Promise<FunctionResponseType<IClientSecret>> {
        try {
            if (debug) {
                throw new Error('Simulated error in createClientSecret');
            }

            const clientSecret = new ClientSecretModel({
                ...data,
            });

            if (session) {
                clientSecret.$session(session);
            }

            await clientSecret.save();

            return successResponse<IClientSecret>(
                MongooseUtils.toPlainObject<IClientSecret>(clientSecret),
                'OAuth client Secrets created successfully'
            );
        } catch (error) {
            logger.error('Error creating client secret:', error);
            return errorResponse<IClientSecret>(error, 'Failed to create OAuth client Secrets');
        }
    }

    async deactivateClientSecretsByClientId(
        clientId: string,
        session?: ClientSession
    ): Promise<FunctionResponseType<null>> {
        try {
            const result = await ClientSecretModel.updateMany(
                { clientId, isActive: true },
                { isActive: false },
                session ? { session } : {}
            );

            return successResponse<null>(
                null,
                `Deactivated ${result.modifiedCount} client secrets for clientId: ${clientId}`
            );
        } catch (error) {
            logger.error('Error deactivating client secrets:', error);
            return errorResponse<null>(error, 'Failed to deactivate client secrets');
        }
    }

    async getActiveClientSecretsByClientId(
        clientId: string
    ): Promise<FunctionResponseType<IClientSecret[] | null>> {
        try {
            const clientSecret = await ClientSecretModel.find({ clientId, isActive: true }).exec();

            if (!clientSecret) {
                return successResponse<IClientSecret[] | null>(
                    null,
                    'No active client secret found'
                );
            }

            return successResponse<IClientSecret[] | null>(
                MongooseUtils.toPlainObjectArray<IClientSecret>(clientSecret),
                'Active client secret retrieved successfully'
            );
        } catch (error) {
            logger.error('Error retrieving active client secret:', error);
            return errorResponse<IClientSecret[] | null>(
                error,
                'Failed to retrieve active client secret'
            );
        }
    }

    async verifyClientSecret(
        clientId: string,
        secretHash: string
    ): Promise<FunctionResponseType<IClientSecret | null>> {
        try {
            const clientSecret = await ClientSecretModel.findOne({
                clientId,
                secretHash,
                isActive: true,
            }).exec();

            if (!clientSecret) {
                return errorResponse<IClientSecret | null>(
                    null,
                    'Client secret verification failed'
                );
            }

            return successResponse<IClientSecret | null>(
                MongooseUtils.toPlainObject<IClientSecret>(clientSecret),
                'Client secret verified successfully'
            );
        } catch (error) {
            logger.error('Error verifying client secret:', error);
            return errorResponse<IClientSecret | null>(error, 'Failed to verify client secret');
        }
    }

    async deactivateClientSecretById(
        secretId: string,
        session?: ClientSession
    ): Promise<FunctionResponseType<null>> {
        try {
            const result = await ClientSecretModel.updateOne(
                { _id: secretId, isActive: true },
                { isActive: false },
                session ? { session } : {}
            );

            if (result.modifiedCount === 0) {
                return errorResponse<null>(
                    null,
                    `No active client secret found with id: ${secretId}`
                );
            }

            return successResponse<null>(null, `Deactivated client secret with id: ${secretId}`);
        } catch (error) {
            logger.error('Error deactivating client secret by id:', error);
            return errorResponse<null>(error, 'Failed to deactivate client secret by id');
        }
    }

    async deleteClientSecretsByClientId(
        clientId: string,
        session?: ClientSession
    ): Promise<FunctionResponseType<null>> {
        try {
            const result = await ClientSecretModel.deleteMany(
                { clientId },
                session ? { session } : {}
            );

            return successResponse<null>(
                null,
                `Deleted ${result.deletedCount} client secrets for clientId: ${clientId}`
            );
        } catch (error) {
            logger.error('Error deleting client secrets by clientId:', error);
            return errorResponse<null>(error, 'Failed to delete client secrets by clientId');
        }
    }

    async deleteClientSecretById(
        secretId: string,
        session?: ClientSession
    ): Promise<FunctionResponseType<null>> {
        try {
            const result = await ClientSecretModel.deleteOne(
                { _id: secretId },
                session ? { session } : {}
            );

            if (result.deletedCount === 0) {
                return errorResponse<null>(null, `No client secret found with id: ${secretId}`);
            }

            return successResponse<null>(null, `Deleted client secret with id: ${secretId}`);
        } catch (error) {
            logger.error('Error deleting client secret by id:', error);
            return errorResponse<null>(error, 'Failed to delete client secret by id');
        }
    }
}
