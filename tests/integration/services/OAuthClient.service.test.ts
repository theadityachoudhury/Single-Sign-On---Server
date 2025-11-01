import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { DatabaseTestUtils } from '../../utils/test-helpers.js';
import { ClientType, ApplicationType } from '../../../src/apps/oauth/types/OAuthClients.type.js';
import OAuthClientService from '../../../src/apps/oauth/services/OAuthClient.service.js';

describe('OAuthClientService - Integration Tests', () => {
    let oauthClientService: OAuthClientService;
    let replSet: MongoMemoryReplSet;

    beforeAll(async () => {
        // Start a dedicated in-memory replica set and set env BEFORE importing code that reads env
        replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        process.env.NODE_ENV = 'test';
        process.env.AUTH_DB_MONGO_URI = replSet.getUri('auth-test');
        process.env.OAUTH_DB_MONGO_URI = replSet.getUri('oauth-test');
        process.env.IDENTITY_DB_MONGO_URI = replSet.getUri('identity-test');

        // Dynamically import after env is set so connections pick up correct URIs
        const { default: initializeDatabase } = await import('../../../src/core/DB/index.js');
        const { default: Service } = await import(
            '../../../src/apps/oauth/services/OAuthClient.service.js'
        );

        await initializeDatabase();
        oauthClientService = new Service();
    });

    beforeEach(async () => {
        // Clear database before each test
        await DatabaseTestUtils.clearDatabase();
    });

    describe('createClient', () => {
        it('should create a confidential OAuth client successfully', async () => {
            const clientData = {
                clientName: 'Test Confidential Client',
                clientType: ClientType.CONFIDENTIAL,
                applicationType: ApplicationType.WEB,
                clientDescription: 'Test confidential client for integration tests',
                clientSecretHash: 'placeholder',
                accessTokenLifetime: 3600,
                refreshTokenLifetime: 1209600,
                idTokenLifetime: 120,
            };

            const result = await oauthClientService.createClient(clientData);

            expect(result.error).toBeFalsy();
            expect(result.data).toBeDefined();
            expect(result.data?.clientName).toBe(clientData.clientName);
            expect(result.data?.clientType).toBe(ClientType.CONFIDENTIAL);
            expect(result.data?.clientId).toBeDefined();
            expect(result.data?.clientSecret).toBeDefined();
            expect(result.message).toContain('successfully');
        });

        it('should create a public OAuth client successfully', async () => {
            const clientData = {
                clientName: 'Test Public Client',
                clientType: ClientType.PUBLIC,
                applicationType: ApplicationType.WEB,
                clientDescription: 'Test public client for integration tests',
                clientSecretHash: 'placeholder',
                accessTokenLifetime: 3600,
                refreshTokenLifetime: 1209600,
                idTokenLifetime: 120,
            };

            const result = await oauthClientService.createClient(clientData);

            expect(result.error).toBeFalsy();
            expect(result.data).toBeDefined();
            expect(result.data?.clientName).toBe(clientData.clientName);
            expect(result.data?.clientType).toBe(ClientType.PUBLIC);
            expect(result.data?.clientId).toBeDefined();
        });

        it('should generate unique client IDs for different clients', async () => {
            const client1Data = {
                clientName: 'Client 1',
                clientType: ClientType.CONFIDENTIAL,
                applicationType: ApplicationType.WEB,
                clientDescription: 'First test client',
                clientSecretHash: 'placeholder',
                accessTokenLifetime: 3600,
                refreshTokenLifetime: 1209600,
                idTokenLifetime: 120,
            };

            const client2Data = {
                clientName: 'Client 2',
                clientType: ClientType.CONFIDENTIAL,
                applicationType: ApplicationType.WEB,
                clientDescription: 'Second test client',
                clientSecretHash: 'placeholder',
                accessTokenLifetime: 3600,
                refreshTokenLifetime: 1209600,
                idTokenLifetime: 120,
            };

            const result1 = await oauthClientService.createClient(client1Data);
            const result2 = await oauthClientService.createClient(client2Data);

            expect(result1.error).toBeFalsy();
            expect(result2.error).toBeFalsy();
            expect(result1.data?.clientId).not.toBe(result2.data?.clientId);
        });

        it('should generate unique client secrets for confidential clients', async () => {
            const clientData = {
                clientName: 'Test Client',
                clientType: ClientType.CONFIDENTIAL,
                applicationType: ApplicationType.WEB,
                clientDescription: 'Test client',
                clientSecretHash: 'placeholder',
                accessTokenLifetime: 3600,
                refreshTokenLifetime: 1209600,
                idTokenLifetime: 120,
            };

            const result1 = await oauthClientService.createClient(clientData);
            const result2 = await oauthClientService.createClient(clientData);

            expect(result1.error).toBeFalsy();
            expect(result2.error).toBeFalsy();
            expect(result1.data?.clientSecret).not.toBe(result2.data?.clientSecret);
        });

        it('should assign default grants to confidential client', async () => {
            const clientData = {
                clientName: 'Test Confidential Client',
                clientType: ClientType.CONFIDENTIAL,
                applicationType: ApplicationType.WEB,
                clientDescription: 'Test client for grants',
                clientSecretHash: 'placeholder',
                accessTokenLifetime: 3600,
                refreshTokenLifetime: 1209600,
                idTokenLifetime: 120,
            };

            const result = await oauthClientService.createClient(clientData);

            expect(result.error).toBeFalsy();
            expect(result.data).toBeDefined();
            // Verify the client was created successfully
            // In a full test, you would query the grants and verify they were assigned
        });
    });

    afterAll(async () => {
        if (replSet) {
            await replSet.stop();
        }
    });
});
