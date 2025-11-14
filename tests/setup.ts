import mongoose from 'mongoose';
import { config } from 'dotenv';
import { beforeAll, afterEach, afterAll } from '@jest/globals';

// Load test environment variables
config({ path: '.env.test' });

// Setup before all tests
beforeAll(async () => {
    // Ensure baseline test environment variables; actual DB URIs
    // should be provided by global setup prior to test execution
    process.env.NODE_ENV ||= 'test';
    process.env.JWT_SECRET ||= 'test-jwt-secret-key-for-testing-only';
    process.env.REFRESH_TOKEN_SECRET ||= 'test-refresh-token-secret';
    process.env.ALLOWED_ORIGINS ||= 'http://localhost:3000,http://localhost:5173';
}, 60000);

// Cleanup after each test
afterEach(async () => {
    // Clear all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key]?.deleteMany({});
    }
});

// Cleanup after all tests
afterAll(async () => {
    // Close all mongoose connections
    await mongoose.disconnect();

    // Global teardown will stop the in-memory MongoDB instance
}, 30000);
