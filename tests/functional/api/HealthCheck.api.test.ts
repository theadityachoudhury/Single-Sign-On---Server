import { describe, it, expect } from '@jest/globals';
import app from '@/app.js';
import request from 'supertest';
import { config } from '@/Config/config.js';

describe('Health Check Endpoint - Functional Test', () => {
    const apiPrefix = config.API_PREFIX || '/api';

    describe(`GET ${apiPrefix}/health`, () => {
        it('should return health status', async () => {
            const response = await request(app).get(`/${apiPrefix}/health`);

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });

        it('should respond quickly (performance check)', async () => {
            const startTime = Date.now();
            await request(app).get(`/${apiPrefix}/health`);
            const endTime = Date.now();

            const responseTime = endTime - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });

        it('should handle multiple concurrent health checks', async () => {
            const requests = Array.from({ length: 10 }, () =>
                request(app).get(`/${apiPrefix}/health`)
            );

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });
    });

    describe('404 Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/non-existent-route');

            expect(response.status).toBe(404);
        });

        it('should return proper error structure for 404', async () => {
            const response = await request(app).get(`/${apiPrefix}/invalid-endpoint`);

            expect(response.status).toBe(404);
            expect(response.body).toBeDefined();
        });
    });
});
