import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import app from '@/app.js';
import { ApiTestClient, HttpAssertions } from '../../utils/api-test-client.js';
import { DatabaseTestUtils, MockDataGenerator } from '../../utils/test-helpers.js';
import { config } from '@/Config/config.js';

describe('OAuth Client API - Functional Tests', () => {
    let apiClient: ApiTestClient;
    const apiPrefix = config.API_PREFIX || '/api';

    beforeAll(() => {
        apiClient = new ApiTestClient(app);
    });

    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    describe('POST /api/oauth/clients', () => {
        it('should create a new confidential OAuth client', async () => {
            const clientData = {
                clientName: 'Test OAuth Client',
                clientType: 'confidential',
                description: 'Test client for API testing',
            };

            const response = await apiClient.post(`${apiPrefix}/oauth/clients`, clientData);

            HttpAssertions.expectSuccess(response, 201);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.clientName).toBe(clientData.clientName);
            expect(response.body.data.clientId).toBeDefined();
            expect(response.body.data.clientSecret).toBeDefined();
        });

        it('should create a new public OAuth client', async () => {
            const clientData = {
                clientName: 'Test Public Client',
                clientType: 'public',
                description: 'Public client for testing',
            };

            const response = await apiClient.post(`${apiPrefix}/oauth/clients`, clientData);

            HttpAssertions.expectSuccess(response, 201);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.clientType).toBe('public');
        });

        it('should reject invalid client data', async () => {
            const invalidData = {
                // Missing required fields
                description: 'Invalid client',
            };

            const response = await apiClient.post(`${apiPrefix}/oauth/clients`, invalidData);

            HttpAssertions.expectValidationError(response);
        });

        it('should handle concurrent client creation', async () => {
            const clientData1 = MockDataGenerator.generateOAuthClient({
                clientName: 'Concurrent Client 1',
            });
            const clientData2 = MockDataGenerator.generateOAuthClient({
                clientName: 'Concurrent Client 2',
            });

            const [response1, response2] = await Promise.all([
                apiClient.post(`${apiPrefix}/oauth/clients`, clientData1),
                apiClient.post(`${apiPrefix}/oauth/clients`, clientData2),
            ]);

            HttpAssertions.expectSuccess(response1, 201);
            HttpAssertions.expectSuccess(response2, 201);
            expect(response1.body.data.clientId).not.toBe(response2.body.data.clientId);
        });
    });

    describe('API Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await apiClient.get('/api/non-existent-route');
            HttpAssertions.expectNotFound(response);
        });

        it('should handle malformed JSON gracefully', async () => {
            const response = await apiClient.post(`${apiPrefix}/oauth/clients`, 'invalid-json', {
                headers: { 'Content-Type': 'application/json' },
            });

            // Should return 400 Bad Request
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });
    });
});
