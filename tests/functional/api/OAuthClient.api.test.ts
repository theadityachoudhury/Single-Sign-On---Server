import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import express from 'express';
import oauthApp from '../../../src/apps/oauth/app.js';
import { notFoundHandler, errorHandler } from '../../../src/core/Middlewares/index.js';
import { ApiTestClient, HttpAssertions } from '../../utils/api-test-client.js';
import { DatabaseTestUtils, MockDataGenerator } from '../../utils/test-helpers.js';
import config from '../../../src/core/Config/config.js';

describe('OAuth Client API - Functional Tests', () => {
    let apiClient: ApiTestClient;
    const apiPrefix = (config.API_PREFIX || '/api').replace(/^\/+/, '');
    const basePath = `/${apiPrefix}/oauth/v1/clients`;

    beforeAll(() => {
        const app = express();
        app.use(express.json());
        app.use(`/${apiPrefix}/oauth`, oauthApp);
        // Attach basic not-found and error handlers to mirror app behavior
        app.use(notFoundHandler);
        app.use(errorHandler);
        apiClient = new ApiTestClient(app);
    });

    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    describe('POST /api/oauth/v1/clients', () => {
        it('should create a new confidential OAuth client', async () => {
            const clientData = {
                clientName: 'Test OAuth Client',
                clientType: 'confidential',
                clientDescription: 'Test client for API testing',
            };

            const response = await apiClient.post(basePath, clientData);

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
                clientDescription: 'Public client for testing',
            };

            const response = await apiClient.post(basePath, clientData);

            HttpAssertions.expectSuccess(response, 201);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.clientType).toBe('public');
        });

        it('should reject invalid client data', async () => {
            const invalidData = {
                // Missing required fields
                clientDescription: 'Invalid client',
            };

            const response = await apiClient.post(basePath, invalidData);

            // Minimal app lacks global error handler; just assert client error status
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });

        it('should handle concurrent client creation', async () => {
            const clientData1 = MockDataGenerator.generateOAuthClient({
                clientName: 'Concurrent Client 1',
            });
            const clientData2 = MockDataGenerator.generateOAuthClient({
                clientName: 'Concurrent Client 2',
            });

            const [response1, response2] = await Promise.all([
                apiClient.post(basePath, clientData1),
                apiClient.post(basePath, clientData2),
            ]);

            HttpAssertions.expectSuccess(response1, 201);
            HttpAssertions.expectSuccess(response2, 201);
            expect(response1.body.data.clientId).not.toBe(response2.body.data.clientId);
        });
    });

    describe('API Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await apiClient.get(`/${apiPrefix}/non-existent-route`);
            // Minimal test app doesn't use global 404 handler, just assert status
            expect(response.status).toBe(404);
        });

        it('should handle malformed JSON gracefully', async () => {
            const response = await apiClient.post(basePath, 'invalid-json', {
                headers: { 'Content-Type': 'application/json' },
            });

            // Should return 400 Bad Request
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });
    });
});
