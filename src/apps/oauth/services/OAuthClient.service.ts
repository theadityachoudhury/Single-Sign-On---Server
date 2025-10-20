import OAuthClientRepository from '@/apps/oauth/repositories/OAuthClient.repository.js';
import { ClientSession } from 'mongoose';
import { CreateOAuthClientDTO, IOAuthClient } from '@/types/OAuth/OAuthClients.type.js';
import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import ClientSecretsRepository from '@/apps/oauth/repositories/ClientSecrets.repository.js';
import { CreateClientSecretDTO } from '@/types/OAuth/ClientSecrets.type.js';
import SecretUtils from '@/Utils/Secret.js';

export default class OAuthClientService {
    private oauthClientRepository: OAuthClientRepository;
    private ClientSecretsRepository: ClientSecretsRepository;

    constructor() {
        this.oauthClientRepository = new OAuthClientRepository();
        this.ClientSecretsRepository = new ClientSecretsRepository();
    }

    async createClient(
        data: CreateOAuthClientDTO,
        session?: ClientSession
    ): Promise<FunctionResponseType<IOAuthClient & { clientSecret?: string }>> {
        try {
            // Generate client secret
            const clientSecret = SecretUtils.generateRandomSecret();
            const clientSecretHash = await SecretUtils.hashSecret(clientSecret);
            const secretHint = SecretUtils.generateSecretHint(clientSecret);

            // Prepare client data
            const clientData = {
                ...data,
                clientSecretHash,
            };

            // 1. Create OAuth Client
            const clientResult = await this.oauthClientRepository.createClient(clientData, session);

            if (clientResult.error) {
                return clientResult as FunctionResponseType<
                    IOAuthClient & { clientSecret?: string }
                >;
            }

            // 2. Create Client Secret record (within same transaction)
            const secretData: CreateClientSecretDTO = {
                clientId: clientResult.data!.clientId,
                secretHash: clientSecretHash,
                secretHint: secretHint,
                description: 'Initial client secret (Default Created)',
                isActive: true,
            };

            const secretResult = await this.ClientSecretsRepository.createClientSecret(
                secretData,
                session
            );

            if (secretResult.error) {
                // If secret creation fails, the transaction will rollback (if using transactions)
                return errorResponse(secretResult.errorDetails, 'Failed to create client secret');
            }

            // Return client with plain secret (only visible once)
            return successResponse(
                {
                    ...clientResult.data!,
                    clientSecret,
                },
                'OAuth client created successfully'
            );
        } catch (error) {
            return errorResponse(error, 'Failed to create OAuth client');
        }
    }
}
