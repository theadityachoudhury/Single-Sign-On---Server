# Test Examples and Patterns

This file contains common testing patterns and examples to help you write effective tests.

## Table of Contents

- [Basic Test Structure](#basic-test-structure)
- [Testing Async Functions](#testing-async-functions)
- [Testing Error Cases](#testing-error-cases)
- [Testing with Database](#testing-with-database)
- [Testing API Endpoints](#testing-api-endpoints)
- [Mocking](#mocking)
- [Testing Middleware](#testing-middleware)

## Basic Test Structure

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
    describe('specificFunction', () => {
        it('should behave as expected', () => {
            // Arrange
            const input = 'test';

            // Act
            const result = someFunction(input);

            // Assert
            expect(result).toBe('expected output');
        });
    });
});
```

## Testing Async Functions

### Basic Async Test

```typescript
it('should handle async operations', async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
    expect(result.data).toBe('expected');
});
```

### Testing Promise Rejection

```typescript
it('should reject invalid input', async () => {
    await expect(asyncFunction('invalid')).rejects.toThrow('Error message');
});

// Or with specific error type
it('should throw ValidationError', async () => {
    await expect(asyncFunction('invalid')).rejects.toThrow(ValidationError);
});
```

### Testing Promise Resolution

```typescript
it('should resolve with data', async () => {
    await expect(asyncFunction('valid')).resolves.toEqual({
        success: true,
        data: expect.any(Object),
    });
});
```

## Testing Error Cases

### Try-Catch Pattern

```typescript
it('should handle errors gracefully', async () => {
    try {
        await riskyFunction();
        fail('Should have thrown an error');
    } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect(error.message).toContain('expected message');
    }
});
```

### Error Response Testing

```typescript
it('should return error response', async () => {
    const result = await service.create(invalidData);

    expect(result.error).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.data).toBeUndefined();
});
```

## Testing with Database

### With beforeEach Cleanup

```typescript
import { beforeEach } from '@jest/globals';
import { DatabaseTestUtils } from '../utils/test-helpers';

describe('Database Operations', () => {
    beforeEach(async () => {
        await DatabaseTestUtils.clearDatabase();
    });

    it('should save data to database', async () => {
        const data = { name: 'test' };
        const result = await repository.save(data);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        // Verify in database
        const saved = await repository.findById(result.id);
        expect(saved.name).toBe('test');
    });
});
```

### Testing Database Constraints

```typescript
it('should enforce unique constraints', async () => {
    const data = { email: 'test@example.com' };

    await repository.create(data);

    // Trying to create duplicate should fail
    await expect(repository.create(data)).rejects.toThrow();
});
```

## Testing API Endpoints

### Basic GET Request

```typescript
import { ApiTestClient } from '../utils/api-test-client';
import app from '@/app.js';

describe('GET /api/endpoint', () => {
    const apiClient = new ApiTestClient(app);

    it('should return data', async () => {
        const response = await apiClient.get('/api/endpoint');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
    });
});
```

### POST Request with Body

```typescript
it('should create resource', async () => {
    const data = {
        name: 'Test Resource',
        description: 'Test description',
    };

    const response = await apiClient.post('/api/resources', data);

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.name).toBe(data.name);
});
```

### Testing with Authentication

```typescript
it('should require authentication', async () => {
    // Without token
    const response = await apiClient.get('/api/protected');
    expect(response.status).toBe(401);

    // With token
    apiClient.setAuthToken('valid-token');
    const authResponse = await apiClient.get('/api/protected');
    expect(authResponse.status).toBe(200);
});
```

### Testing Validation Errors

```typescript
it('should validate input', async () => {
    const invalidData = {
        // Missing required field
        description: 'test',
    };

    const response = await apiClient.post('/api/resources', invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('required');
});
```

## Mocking

### Mock External Service

```typescript
import { jest } from '@jest/globals';

jest.mock('../services/EmailService', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));

it('should send email', async () => {
    const result = await notificationService.notify('user@example.com');

    expect(EmailService.sendEmail).toHaveBeenCalledWith('user@example.com', expect.any(String));
    expect(result).toBe(true);
});
```

### Mock Repository

```typescript
const mockRepository = {
    findById: jest.fn().mockResolvedValue({ id: '123', name: 'Test' }),
    create: jest.fn().mockResolvedValue({ id: '456', name: 'Created' }),
    update: jest.fn().mockResolvedValue({ id: '123', name: 'Updated' }),
    delete: jest.fn().mockResolvedValue(true),
};

it('should use mocked repository', async () => {
    const service = new MyService(mockRepository);
    const result = await service.getById('123');

    expect(mockRepository.findById).toHaveBeenCalledWith('123');
    expect(result.id).toBe('123');
});
```

### Spy on Existing Function

```typescript
it('should call logger', () => {
    const loggerSpy = jest.spyOn(console, 'log');

    functionThatLogs('test message');

    expect(loggerSpy).toHaveBeenCalledWith('test message');

    loggerSpy.mockRestore();
});
```

## Testing Middleware

### Request/Response Mocking

```typescript
import { Request, Response, NextFunction } from 'express';

describe('Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {},
            query: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
    });

    it('should validate request', () => {
        mockRequest.body = { name: 'test' };

        validationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
    });

    it('should return error for invalid request', () => {
        mockRequest.body = {}; // Missing required field

        validationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
```

## Advanced Patterns

### Testing Concurrent Operations

```typescript
it('should handle concurrent requests', async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
        apiClient.post('/api/resources', { name: `Resource ${i}` })
    );

    const responses = await Promise.all(requests);

    // All should succeed
    responses.forEach(response => {
        expect(response.status).toBe(201);
    });

    // All should have unique IDs
    const ids = responses.map(r => r.body.data.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
});
```

### Testing with Timeout

```typescript
it('should complete within time limit', async () => {
    const startTime = Date.now();

    await performOperation();

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // 1 second
});
```

### Testing Retry Logic

```typescript
it('should retry on failure', async () => {
    let attempts = 0;
    const mockFn = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
            throw new Error('Temporary failure');
        }
        return 'success';
    });

    const result = await retryableFunction(mockFn, { maxRetries: 3 });

    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result).toBe('success');
});
```

### Parameterized Tests

```typescript
describe.each([
    { input: 'test1', expected: 'TEST1' },
    { input: 'test2', expected: 'TEST2' },
    { input: 'test3', expected: 'TEST3' },
])('processInput($input)', ({ input, expected }) => {
    it(`should return ${expected}`, () => {
        expect(processInput(input)).toBe(expected);
    });
});
```

### Snapshot Testing

```typescript
it('should match snapshot', () => {
    const data = {
        id: '123',
        name: 'Test',
        createdAt: '2024-01-01',
    };

    expect(formatResponse(data)).toMatchSnapshot();
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(expected); // === comparison
expect(value).toEqual(expected); // Deep equality
expect(value).toStrictEqual(expected); // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeLessThan(10);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(0.3, 5); // Floating point

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/regex/);
expect(string).toHaveLength(10);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(5);
expect(array).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', value);
expect(object).toMatchObject({ key: value });

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(3);
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenLastCalledWith(arg);

// Type checking
expect(value).toBeInstanceOf(Class);
expect(value).toBe(expect.any(Number));
expect(value).toBe(expect.anything());
```

## Tips and Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test one thing per test** - keep tests focused
4. **Use beforeEach** for setup, **afterEach** for cleanup
5. **Don't test implementation details** - test behavior
6. **Mock external dependencies** to isolate what you're testing
7. **Test edge cases**: null, undefined, empty, very large inputs
8. **Keep tests fast** - under 1 second per test ideal
9. **Make tests independent** - they should not rely on each other
10. **Clean up test data** after each test
