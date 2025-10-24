import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { beforeAll, afterEach, afterAll } from '@jest/globals';

// Load test environment variables
config({ path: '.env.test' });

let mongoServer: MongoMemoryReplSet;

// Setup before all tests
beforeAll(async () => {
    // Create in-memory MongoDB replica set to support transactions/sessions
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    // Use helper to include DB name while preserving replicaSet query params
    const authUri = mongoServer.getUri('auth-test');
    const oauthUri = mongoServer.getUri('oauth-test');
    const identityUri = mongoServer.getUri('identity-test');

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.AUTH_DB_MONGO_URI = authUri;
    process.env.OAUTH_DB_MONGO_URI = oauthUri;
    process.env.IDENTITY_DB_MONGO_URI = identityUri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173';
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

    // Stop in-memory MongoDB
    if (mongoServer) {
        await mongoServer.stop();
    }
}, 30000);
