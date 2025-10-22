import OAuthClientRepository from '@/apps/oauth/repositories/OAuthClient.repository.js';
import { ClientSession } from 'mongoose';
import { ClientType, CreateOAuthClientDTO, IOAuthClient } from '@/types/OAuth/OAuthClients.type.js';
import {
    errorResponse,
    FunctionResponseType,
    successResponse,
} from '@/core/Types/Response.type.js';
import ClientSecretsRepository from '@/apps/oauth/repositories/ClientSecrets.repository.js';
import { CreateClientSecretDTO } from '@/types/OAuth/ClientSecrets.type.js';
import SecretUtils from '@/Utils/Secret.js';
import { clientGrantType } from '@/types/OAuth/ClientGrants.type.js';
import ClientGrantsRepository from '@/apps/oauth/repositories/ClientGrants.repository.js';
import ClientResponseTypesRepository from '@/apps/oauth/repositories/ClientResponseTypes.repository.js';
import { responseType } from '@/apps/oauth/types/ClientResponse.type.js';

export default class OAuthClientService {
    private oauthClientRepository: OAuthClientRepository;
    private ClientSecretsRepository: ClientSecretsRepository;
    private ClientGrantsRepository: ClientGrantsRepository;
    private ClientResponseTypesRepository: ClientResponseTypesRepository;

    // Default grant types based on OAuth 2.0 best practices
    private readonly DEFAULT_GRANTS = {
        [ClientType.CONFIDENTIAL]: [
            clientGrantType.AUTHORIZATION_CODE,
            clientGrantType.REFRESH_TOKEN,
            clientGrantType.CLIENT_CREDENTIALS,
        ],
        [ClientType.PUBLIC]: [clientGrantType.AUTHORIZATION_CODE, clientGrantType.REFRESH_TOKEN],
    };

    // Default response types based on security best practices
    private readonly DEFAULT_RESPONSE_TYPES = {
        [ClientType.CONFIDENTIAL]: [
            responseType.CODE, // Authorization code flow (most secure)
            responseType.CODE_ID_TOKEN, // Hybrid flow (auth + immediate ID)
        ],
        [ClientType.PUBLIC]: [
            responseType.CODE, // Authorization code with PKCE
        ],
    };

    constructor() {
        this.oauthClientRepository = new OAuthClientRepository();
        this.ClientSecretsRepository = new ClientSecretsRepository();
        this.ClientGrantsRepository = new ClientGrantsRepository();
        this.ClientResponseTypesRepository = new ClientResponseTypesRepository();
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

            if (clientResult.data?.clientType === ClientType.PUBLIC) {
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
                    return errorResponse(
                        secretResult.errorDetails,
                        'Failed to create client secret'
                    );
                }
            }
            const grantsToAssign = this.DEFAULT_GRANTS[data.clientType] || [];
            // 3. Assign Default Grant Types
            for (const grantType of grantsToAssign) {
                const grant = await this.ClientGrantsRepository.assignGrantToClient(
                    {
                        clientId: clientResult.data!.clientId,
                        grantType,
                    },
                    session
                );

                if (grant.error) {
                    return errorResponse(grant.errorDetails, 'Failed to assign client grant');
                }
            }

            const responseTypesToAssign = this.DEFAULT_RESPONSE_TYPES[data.clientType] || [];
            // 4. Assign Default Response Types
            for (const respType of responseTypesToAssign) {
                const responseTypeResult =
                    await this.ClientResponseTypesRepository.assignResponseTypeToClient(
                        {
                            clientId: clientResult.data!.clientId,
                            responseType: respType,
                        },
                        session
                    );

                if (responseTypeResult.error) {
                    return errorResponse(
                        responseTypeResult.errorDetails,
                        'Failed to assign response type'
                    );
                }
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
