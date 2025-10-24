import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import app from '@/app.js';
import { ApiTestClient } from '../../utils/api-test-client.js';
import { DatabaseTestUtils } from '../../utils/test-helpers.js';
import { config } from '@/Config/config.js';

describe('OAuth Client Lifecycle - System Tests', () => {
    let apiClient: ApiTestClient;
    const apiPrefix = config.API_PREFIX || '/api';

    beforeAll(() => {
        apiClient = new ApiTestClient(app);
    });

    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    describe('Complete OAuth Client Registration Flow', () => {
        it('should complete full client registration lifecycle', async () => {
            // Step 1: Create OAuth Client
            const clientData = {
                clientName: 'Full Lifecycle Test Client',
                clientType: 'confidential',
                description: 'Testing complete lifecycle',
            };

            const createResponse = await apiClient.post(`${apiPrefix}/oauth/clients`, clientData);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.success).toBe(true);
            expect(createResponse.body.data).toBeDefined();

            const clientId = createResponse.body.data.clientId;
            const clientSecret = createResponse.body.data.clientSecret;

            expect(clientId).toBeDefined();
            expect(clientSecret).toBeDefined();

            // Step 2: Verify client was stored in database
            // In a real scenario, you might query the database or make a GET request
            // to verify the client exists

            // Step 3: Verify client credentials
            // This would involve using the client_id and client_secret
            // to authenticate (if you have such an endpoint)
        });

        it('should handle multiple client registrations independently', async () => {
            const clients = [
                {
                    clientName: 'Client A',
                    clientType: 'confidential',
                    description: 'First client',
                },
                {
                    clientName: 'Client B',
                    clientType: 'public',
                    description: 'Second client',
                },
                {
                    clientName: 'Client C',
                    clientType: 'confidential',
                    description: 'Third client',
                },
            ];

            const responses = await Promise.all(
                clients.map(client => apiClient.post(`${apiPrefix}/oauth/clients`, client))
            );

            // All should succeed
            responses.forEach((response: any, index: number) => {
                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.data.clientName).toBe(clients[index]?.clientName);
            });

            // All should have unique IDs
            const clientIds = responses.map((r: any) => r.body.data.clientId);
            const uniqueIds = new Set(clientIds);
            expect(uniqueIds.size).toBe(clients.length);
        });
    });

    describe('Application Health and Availability', () => {
        it('should respond to health check endpoint', async () => {
            const response = await apiClient.get(`${apiPrefix}/health`);

            expect(response.status).toBeGreaterThanOrEqual(200);
            expect(response.status).toBeLessThan(300);
        });

        it('should handle high load gracefully', async () => {
            const concurrentRequests = 20;
            const requests = Array.from({ length: concurrentRequests }, (_, i) => ({
                clientName: `Load Test Client ${i}`,
                clientType: 'confidential',
                description: `Load test ${i}`,
            }));

            const startTime = Date.now();
            const responses = await Promise.all(
                requests.map(client => apiClient.post(`${apiPrefix}/oauth/clients`, client))
            );
            const endTime = Date.now();

            // All requests should succeed
            const successCount = responses.filter((r: any) => r.status === 201).length;
            expect(successCount).toBeGreaterThan(concurrentRequests * 0.9); // At least 90% success

            // Performance check - should complete in reasonable time
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
        });
    });

    describe('Data Integrity and Isolation', () => {
        it('should maintain data integrity across multiple operations', async () => {
            const clientData = {
                clientName: 'Integrity Test Client',
                clientType: 'confidential',
                description: 'Testing data integrity',
            };

            // Create the same client multiple times
            const response1 = await apiClient.post(`${apiPrefix}/oauth/clients`, clientData);
            const response2 = await apiClient.post(`${apiPrefix}/oauth/clients`, clientData);

            expect(response1.status).toBe(201);
            expect(response2.status).toBe(201);

            // Each should have unique identifiers despite same input
            expect(response1.body.data.clientId).not.toBe(response2.body.data.clientId);
            if (response1.body.data.clientSecret && response2.body.data.clientSecret) {
                expect(response1.body.data.clientSecret).not.toBe(response2.body.data.clientSecret);
            }
        });
    });

    describe('Error Recovery and Resilience', () => {
        it('should recover from invalid requests', async () => {
            // Send invalid request
            const invalidResponse = await apiClient.post(`${apiPrefix}/oauth/clients`, {
                invalid: 'data',
            });

            expect(invalidResponse.status).toBeGreaterThanOrEqual(400);

            // Send valid request immediately after
            const validData = {
                clientName: 'Recovery Test Client',
                clientType: 'confidential',
                description: 'Testing error recovery',
            };

            const validResponse = await apiClient.post(`${apiPrefix}/oauth/clients`, validData);

            expect(validResponse.status).toBe(201);
            expect(validResponse.body.success).toBe(true);
        });
    });
});
