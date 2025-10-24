# Testing Setup Guide

## Overview

This document provides a comprehensive guide to the testing infrastructure for the Single Sign-On Server project.

## Testing Stack

- **Jest**: Testing framework and test runner
- **ts-jest**: TypeScript preprocessor for Jest
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **@jest/globals**: Jest global functions with TypeScript support

## Quick Start

### 1. Install Dependencies

All testing dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Run Your First Test

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### 3. View Results

Test results will appear in your terminal. Coverage reports are generated in the `coverage/` directory.

## Test Configuration Files

### `jest.config.ts`

Main Jest configuration file that defines:
- Test environment (Node.js)
- Module resolution and path mapping
- Coverage thresholds and reporters
- Test file patterns
- Setup files

### `tsconfig.test.json`

TypeScript configuration specifically for tests:
- Extends base `tsconfig.json`
- Includes test directories
- Configures output for test compilation

### `tests/setup.ts`

Global test setup file that runs before all tests:
- Initializes MongoDB Memory Server
- Sets test environment variables
- Configures global cleanup hooks
- Sets default timeout

### `.env.test`

Test-specific environment variables:
- Safe default values for testing
- No sensitive information
- MongoDB URIs (overridden by Memory Server)
- Test-specific configuration

## Test Utilities

### DatabaseTestUtils (`tests/utils/test-helpers.ts`)

```typescript
// Clear all collections
await DatabaseTestUtils.clearDatabase();

// Drop entire database
await DatabaseTestUtils.dropDatabase();

// Get collection count
const count = await DatabaseTestUtils.getCollectionCount('clients');
```

### MockDataGenerator (`tests/utils/test-helpers.ts`)

```typescript
// Generate random data
const email = MockDataGenerator.generateRandomEmail();
const url = MockDataGenerator.generateRandomUrl();
const client = MockDataGenerator.generateOAuthClient({
    clientName: 'Custom Name'
});
```

### ApiTestClient (`tests/utils/api-test-client.ts`)

```typescript
const apiClient = new ApiTestClient(app);

// Make authenticated requests
apiClient.setAuthToken('your-token');
const response = await apiClient.get('/api/endpoint');

// Make POST requests
const createResponse = await apiClient.post('/api/clients', data);
```

### HttpAssertions (`tests/utils/api-test-client.ts`)

```typescript
// Assert successful responses
HttpAssertions.expectSuccess(response, 201);

// Assert error responses
HttpAssertions.expectError(response, 400);
HttpAssertions.expectValidationError(response);
HttpAssertions.expectUnauthorized(response);
HttpAssertions.expectNotFound(response);
```

## Writing Different Test Types

### Unit Tests

**Location:** `tests/unit/`

**Purpose:** Test individual functions in isolation

**Template:**
```typescript
import { describe, it, expect } from '@jest/globals';
import { YourClass } from '@/path/to/class.js';

describe('YourClass', () => {
    describe('yourMethod', () => {
        it('should do something specific', () => {
            // Arrange
            const input = 'test';
            
            // Act
            const result = YourClass.yourMethod(input);
            
            // Assert
            expect(result).toBe('expected');
        });
    });
});
```

### Integration Tests

**Location:** `tests/integration/`

**Purpose:** Test component interactions with database

**Template:**
```typescript
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import YourService from '@/apps/module/services/YourService.js';
import initializeDatabase from '@/core/DB/index.js';
import { DatabaseTestUtils } from '../../utils/test-helpers.js';

describe('YourService - Integration Tests', () => {
    let service: YourService;

    beforeAll(async () => {
        await initializeDatabase();
        service = new YourService();
    });

    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    it('should create and persist data', async () => {
        const data = { name: 'test' };
        const result = await service.create(data);
        
        expect(result.error).toBeFalsy();
        expect(result.data).toBeDefined();
    });
});
```

### Functional Tests

**Location:** `tests/functional/`

**Purpose:** Test API endpoints

**Template:**
```typescript
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import app from '@/app.js';
import { ApiTestClient, HttpAssertions } from '../../utils/api-test-client.js';
import { DatabaseTestUtils } from '../../utils/test-helpers.js';

describe('API Endpoint Tests', () => {
    let apiClient: ApiTestClient;

    beforeAll(() => {
        apiClient = new ApiTestClient(app);
    });

    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    it('should create resource via API', async () => {
        const data = { name: 'test' };
        const response = await apiClient.post('/api/resource', data);
        
        HttpAssertions.expectSuccess(response, 201);
        expect(response.body.data).toBeDefined();
    });
});
```

### System Tests

**Location:** `tests/system/`

**Purpose:** Test complete workflows end-to-end

**Template:**
```typescript
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import app from '@/app.js';
import { ApiTestClient } from '../../utils/api-test-client.js';
import { DatabaseTestUtils } from '../../utils/test-helpers.js';

describe('Complete User Flow', () => {
    let apiClient: ApiTestClient;

    beforeAll(() => {
        apiClient = new ApiTestClient(app);
    });

    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    it('should complete entire workflow', async () => {
        // Step 1: Create resource
        const createRes = await apiClient.post('/api/resource', data);
        expect(createRes.status).toBe(201);
        
        // Step 2: Get resource
        const id = createRes.body.data.id;
        const getRes = await apiClient.get(`/api/resource/${id}`);
        expect(getRes.status).toBe(200);
        
        // Step 3: Update resource
        const updateRes = await apiClient.put(`/api/resource/${id}`, updates);
        expect(updateRes.status).toBe(200);
        
        // Step 4: Delete resource
        const deleteRes = await apiClient.delete(`/api/resource/${id}`);
        expect(deleteRes.status).toBe(204);
    });
});
```

## Common Testing Patterns

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw error for invalid input', async () => {
    await expect(functionThatThrows()).rejects.toThrow('Error message');
});
```

### Testing Timeouts

```typescript
it('should complete within time limit', async () => {
    const start = Date.now();
    await operation();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
});
```

### Testing Concurrent Operations

```typescript
it('should handle concurrent requests', async () => {
    const requests = Array.from({ length: 10 }, () => 
        apiClient.post('/api/endpoint', data)
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
        expect(response.status).toBe(201);
    });
});
```

## Debugging Tests

### Run Specific Test File

```bash
npm test tests/unit/utils/Secret.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should create client"
```

### Run in Watch Mode

```bash
npm run test:watch
```

### Debug with VSCode

Add to `.vscode/launch.json`:

```json
{
    "type": "node",
    "request": "launch",
    "name": "Jest Debug",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": [
        "--runInBand",
        "--no-cache",
        "${fileBasename}"
    ],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
}
```

## Continuous Integration

Tests run automatically on:
- Every push to main/develop branches
- Every pull request
- Manual workflow dispatch

See `.github/workflows/ci-tests.yml` for CI configuration.

## Troubleshooting

### Issue: Tests timeout

**Solution:**
```typescript
// Increase timeout for specific test
it('slow test', async () => {
    // test code
}, 60000); // 60 second timeout

// Or in jest.config.ts
testTimeout: 30000
```

### Issue: Module not found errors

**Solution:**
- Check path aliases in `jest.config.ts`
- Ensure `.js` extension in imports
- Verify `moduleNameMapper` configuration

### Issue: MongoDB Memory Server fails

**Solution:**
```bash
# Clear cache
rm -rf ~/.cache/mongodb-memory-server

# Reinstall
npm install mongodb-memory-server --save-dev
```

### Issue: Coverage below threshold

**Solution:**
- Add more test cases
- Test edge cases and error paths
- Review uncovered lines in coverage report

## Performance Tips

1. **Use `beforeAll` for expensive setup** instead of `beforeEach`
2. **Clear only necessary data** between tests
3. **Run tests in parallel** (Jest default)
4. **Mock external services** to avoid network calls
5. **Use MongoDB Memory Server** instead of real database

## Best Practices Checklist

- [ ] Each test is independent and can run alone
- [ ] Test names clearly describe what is being tested
- [ ] Use Arrange-Act-Assert pattern
- [ ] Clean up test data after tests
- [ ] Mock external dependencies
- [ ] Test both success and error cases
- [ ] Test edge cases (null, empty, large inputs)
- [ ] Keep tests fast (< 1 second per test ideal)
- [ ] Maintain code coverage above 70%
- [ ] Document complex test setups

## Next Steps

1. Run the existing tests: `npm test`
2. Review test coverage: `npm run test:coverage`
3. Write tests for new features before implementing (TDD)
4. Add tests to your PR checklist
5. Monitor CI test results

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
