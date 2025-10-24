import request from 'supertest';
import { Express } from 'express';
import { expect } from '@jest/globals';

/**
 * API Test Client - Wrapper around supertest with common configurations
 */
export class ApiTestClient {
    private app: Express;
    private authToken?: string;

    constructor(app: Express) {
        this.app = app;
    }

    /**
     * Set authentication token for subsequent requests
     */
    setAuthToken(token: string): void {
        this.authToken = token;
    }

    /**
     * Clear authentication token
     */
    clearAuthToken(): void {
        this.authToken = undefined;
    }

    /**
     * Make GET request
     */
    get(url: string, options?: { headers?: Record<string, string> }) {
        const req = request(this.app).get(url);

        if (this.authToken) {
            req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                req.set(key, value);
            });
        }

        return req;
    }

    /**
     * Make POST request
     */
    post(url: string, body?: any, options?: { headers?: Record<string, string> }) {
        const req = request(this.app).post(url).send(body);

        if (this.authToken) {
            req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                req.set(key, value);
            });
        }

        return req;
    }

    /**
     * Make PUT request
     */
    put(url: string, body?: any, options?: { headers?: Record<string, string> }) {
        const req = request(this.app).put(url).send(body);

        if (this.authToken) {
            req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                req.set(key, value);
            });
        }

        return req;
    }

    /**
     * Make PATCH request
     */
    patch(url: string, body?: any, options?: { headers?: Record<string, string> }) {
        const req = request(this.app).patch(url).send(body);

        if (this.authToken) {
            req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                req.set(key, value);
            });
        }

        return req;
    }

    /**
     * Make DELETE request
     */
    delete(url: string, options?: { headers?: Record<string, string> }) {
        const req = request(this.app).delete(url);

        if (this.authToken) {
            req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                req.set(key, value);
            });
        }

        return req;
    }
}

/**
 * Common HTTP assertion helpers
 */
export class HttpAssertions {
    static expectSuccess(response: any, statusCode: number = 200) {
        expect(response.status).toBe(statusCode);
        expect(response.body.success).toBe(true);
    }

    static expectError(response: any, statusCode: number) {
        expect(response.status).toBe(statusCode);
        expect(response.body.success).toBe(false);
    }

    static expectValidationError(response: any) {
        this.expectError(response, 400);
        expect(response.body.message).toBeDefined();
    }

    static expectUnauthorized(response: any) {
        this.expectError(response, 401);
    }

    static expectForbidden(response: any) {
        this.expectError(response, 403);
    }

    static expectNotFound(response: any) {
        this.expectError(response, 404);
    }
}
