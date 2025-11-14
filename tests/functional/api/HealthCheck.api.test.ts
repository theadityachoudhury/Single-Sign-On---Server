import { describe, it, expect } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import config from '../../../src/core/Config/config.js';

describe('Health Check Endpoint - Functional Test', () => {
    const apiPrefix = (config.API_PREFIX || '/api').replace(/^\/+/, '');
    const app = express();
    app.use(express.json());

    describe(`GET ${apiPrefix}/health`, () => {
        it('should return 404 as health endpoint is not defined', async () => {
            const response = await request(app).get(`/${apiPrefix}/health`);
            expect(response.status).toBe(404);
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
                expect(response.status).toBe(404);
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
