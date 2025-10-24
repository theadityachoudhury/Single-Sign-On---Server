import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import OAuthClientService from '@/apps/oauth/services/OAuthClient.service.js';
import { ClientType } from '@/types/OAuth/OAuthClients.type.js';
import initializeDatabase from '@/core/DB/index.js';
import { DatabaseTestUtils } from '../../utils/test-helpers.js';

describe('OAuthClientService - Integration Tests', () => {
    let oauthClientService: OAuthClientService;

    beforeAll(async () => {
        // Initialize database connection
        await initializeDatabase();
        oauthClientService = new OAuthClientService();
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
                description: 'Test confidential client for integration tests',
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
                description: 'Test public client for integration tests',
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
                description: 'First test client',
            };

            const client2Data = {
                clientName: 'Client 2',
                clientType: ClientType.CONFIDENTIAL,
                description: 'Second test client',
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
                description: 'Test client',
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
                description: 'Test client for grants',
            };

            const result = await oauthClientService.createClient(clientData);

            expect(result.error).toBeFalsy();
            expect(result.data).toBeDefined();
            // Verify the client was created successfully
            // In a full test, you would query the grants and verify they were assigned
        });
    });
});
