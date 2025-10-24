# Testing Documentation

This project uses **Jest** as the testing framework with comprehensive test coverage across multiple testing levels.

## Table of Contents

- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Test Structure

```
tests/
├── setup.ts                    # Global test setup and teardown
├── utils/                      # Test utilities and helpers
│   ├── test-helpers.ts        # Database and mock data utilities
│   └── api-test-client.ts     # HTTP testing client wrapper
├── unit/                       # Unit tests (isolated components)
│   └── utils/
│       └── Secret.test.ts
├── integration/                # Integration tests (multiple components)
│   └── services/
│       └── OAuthClient.service.test.ts
├── functional/                 # Functional tests (API endpoints)
│   └── api/
│       └── OAuthClient.api.test.ts
└── system/                     # System tests (end-to-end flows)
    └── OAuthClientLifecycle.system.test.ts
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests by Type

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Functional tests only
npm run test:functional

# System tests only
npm run test:system
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# Generate and open coverage report in browser
npm run test:coverage:report
```

### CI Mode
```bash
# Run tests in CI environment
npm run test:ci
```

## Test Types

### 1. Unit Tests (`tests/unit/`)

**Purpose:** Test individual functions, classes, or modules in isolation.

**Characteristics:**
- Fast execution
- No external dependencies
- Mock all dependencies
- Focus on single responsibility

**Example:**
```typescript
describe('SecretUtils', () => {
    it('should generate a random secret', () => {
        const secret = SecretUtils.generateRandomSecret();
        expect(secret).toBeDefined();
        expect(typeof secret).toBe('string');
    });
});
```

### 2. Integration Tests (`tests/integration/`)

**Purpose:** Test interactions between multiple components (e.g., services + repositories + database).

**Characteristics:**
- Use real database (MongoDB Memory Server)
- Test component interactions
- Verify data persistence
- Moderate execution speed

**Example:**
```typescript
describe('OAuthClientService', () => {
    it('should create client and persist to database', async () => {
        const result = await oauthClientService.createClient(clientData);
        expect(result.error).toBeFalsy();
        // Verify in database...
    });
});
```

### 3. Functional Tests (`tests/functional/`)

**Purpose:** Test API endpoints and their responses.

**Characteristics:**
- Test HTTP requests/responses
- Verify API contracts
- Test validation and error handling
- Use Supertest

**Example:**
```typescript
describe('POST /api/oauth/clients', () => {
    it('should create OAuth client via API', async () => {
        const response = await apiClient.post('/api/oauth/clients', data);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });
});
```

### 4. System Tests (`tests/system/`)

**Purpose:** Test complete end-to-end workflows and system behavior.

**Characteristics:**
- Test full user journeys
- Verify system-wide behavior
- Test performance and load
- Test error recovery

**Example:**
```typescript
describe('Complete OAuth Flow', () => {
    it('should complete full client registration lifecycle', async () => {
        // Create client
        // Verify credentials
        // Test authorization
        // Verify tokens
    });
});
```

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts` or `*.spec.ts`
- Place tests in appropriate directory based on type
- Mirror source code structure where possible

### Test Structure

```typescript
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';

describe('Feature or Component Name', () => {
    // Setup before all tests in this suite
    beforeAll(async () => {
        // Initialize resources
    });

    // Setup before each test
    beforeEach(async () => {
        // Reset state
        await DatabaseTestUtils.clearDatabase();
    });

    // Cleanup after each test
    afterEach(async () => {
        // Clean up test data
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Close connections
    });

    describe('Specific Functionality', () => {
        it('should do something specific', () => {
            // Arrange
            const input = 'test';

            // Act
            const result = doSomething(input);

            // Assert
            expect(result).toBe('expected');
        });
    });
});
```

### Using Test Utilities

```typescript
import { DatabaseTestUtils, MockDataGenerator, TestCleanup } from '../utils/test-helpers';
import { ApiTestClient, HttpAssertions } from '../utils/api-test-client';

// Clear database
await DatabaseTestUtils.clearDatabase();

// Generate mock data
const clientData = MockDataGenerator.generateOAuthClient();

// Make API requests
const apiClient = new ApiTestClient(app);
const response = await apiClient.post('/api/endpoint', data);

// Assert HTTP responses
HttpAssertions.expectSuccess(response, 201);
HttpAssertions.expectError(response, 400);
```

## Best Practices

### 1. Test Independence
- Each test should be independent
- Tests should not rely on execution order
- Clean up data after each test

### 2. Descriptive Test Names
```typescript
// ✅ Good
it('should return 400 when client name is missing')

// ❌ Bad
it('test client creation')
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should hash secret correctly', async () => {
    // Arrange
    const plainSecret = 'my-secret';

    // Act
    const hashed = await SecretUtils.hashSecret(plainSecret);

    // Assert
    expect(hashed).not.toBe(plainSecret);
});
```

### 4. Test Edge Cases
- Empty inputs
- Null/undefined values
- Very large inputs
- Concurrent operations
- Error conditions

### 5. Mock External Dependencies
```typescript
jest.mock('@/external-service', () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
}));
```

### 6. Use Test Data Builders
```typescript
const clientData = MockDataGenerator.generateOAuthClient({
    clientName: 'Custom Name',
    // Override specific fields
});
```

## Coverage Requirements

The project maintains the following coverage thresholds:

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

View coverage report after running:
```bash
npm run test:coverage
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Troubleshooting

### Tests Timeout
- Increase timeout in specific test: `it('test', async () => {...}, 60000)`
- Increase global timeout in `jest.config.ts`

### Database Connection Issues
- Ensure MongoDB Memory Server is properly initialized
- Check `tests/setup.ts` configuration

### Module Resolution Issues
- Verify path aliases in `jest.config.ts` match `tsconfig.json`
- Check that `ts-jest` is configured with ESM support

### Memory Issues
- Reduce `maxWorkers` in jest config
- Clear database more frequently
- Close connections properly in `afterAll`

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Meet coverage requirements: `npm run test:coverage`
4. Follow existing test patterns and structure
