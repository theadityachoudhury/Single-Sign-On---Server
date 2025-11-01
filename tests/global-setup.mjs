/* eslint-env node */
/* global process */
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function globalSetup() {
  // Start a single in-memory replica set for all tests
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });

  // Make URIs available to all test files before they import application code
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.AUTH_DB_MONGO_URI = replSet.getUri('auth-test');
  process.env.OAUTH_DB_MONGO_URI = replSet.getUri('oauth-test');
  process.env.IDENTITY_DB_MONGO_URI = replSet.getUri('identity-test');

  // Expose the instance to global teardown (Jest guarantees availability across setup/teardown)
  globalThis.__MONGO_REPLSET__ = replSet;
}
