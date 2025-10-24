# Testing Quick Reference Card

## 🚀 Quick Commands

```bash
# Run all tests
npm test

# Run by type
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:functional    # Functional/API tests only
npm run test:system        # System/E2E tests only

# Development
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report

# CI/CD
npm run test:ci            # CI mode
```

## 📁 Test Structure

```
tests/
├── unit/           # Individual functions/classes
├── integration/    # Services + Database
├── functional/     # API endpoints
└── system/         # End-to-end workflows
```

## 🔧 Quick Test Template

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Feature Name', () => {
    beforeEach(async () => {
        // Setup
    });

    it('should do something', async () => {
        // Arrange
        const input = 'test';
        
        // Act
        const result = await doSomething(input);
        
        // Assert
        expect(result).toBeDefined();
    });
});
```

## 🎯 Common Assertions

```typescript
// Equality
expect(value).toBe(expected)
expect(value).toEqual(expected)

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(5)
expect(value).toBeLessThan(10)

// Strings
expect(string).toContain('text')
expect(string).toMatch(/regex/)

// Arrays
expect(array).toHaveLength(5)
expect(array).toContain(item)

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

## 🛠️ Test Utilities

```typescript
// Database
import { DatabaseTestUtils } from '../utils/test-helpers';
await DatabaseTestUtils.clearDatabase();

// Mock Data
import { MockDataGenerator } from '../utils/test-helpers';
const email = MockDataGenerator.generateRandomEmail();
const client = MockDataGenerator.generateOAuthClient();

// API Testing
import { ApiTestClient, HttpAssertions } from '../utils/api-test-client';
const apiClient = new ApiTestClient(app);
const response = await apiClient.post('/api/endpoint', data);
HttpAssertions.expectSuccess(response, 201);
```

## 📊 Coverage Thresholds

| Metric     | Minimum |
|------------|---------|
| Branches   | 70%     |
| Functions  | 70%     |
| Lines      | 70%     |
| Statements | 70%     |

## 🐛 Debugging

```bash
# Run specific file
npm test tests/unit/utils/Secret.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Watch mode
npm run test:watch

# Verbose output
npm test -- --verbose
```

## 📝 Best Practices

✅ **DO:**
- Test behavior, not implementation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Clean up after tests
- Keep tests fast (< 1s per test)

❌ **DON'T:**
- Test implementation details
- Make tests depend on each other
- Use hardcoded IDs or timestamps
- Leave test data in database
- Skip error cases

## 🔗 Documentation

- **Main Guide**: `TESTING.md`
- **Examples**: `tests/EXAMPLES.md`
- **Test Docs**: `tests/README.md`
- **Setup Info**: `TESTING_SETUP_COMPLETE.md`

## 📈 Test Types

| Type | Purpose | Example |
|------|---------|---------|
| **Unit** | Individual functions | Hash function |
| **Integration** | Multiple components | Service + DB |
| **Functional** | API endpoints | POST /api/client |
| **System** | Complete workflows | Full registration |

## 🎨 File Naming

```
ComponentName.test.ts      # Unit test
ServiceName.service.test.ts # Integration test
EndpointName.api.test.ts   # Functional test
FlowName.system.test.ts    # System test
```

## ⚡ Performance Tips

- Use `beforeAll` for expensive setup
- Clear only needed data between tests
- Run tests in parallel (default)
- Mock external services
- Use MongoDB Memory Server

## 🚨 Common Issues

**Tests timeout?**
```typescript
it('test', async () => { ... }, 60000); // 60s timeout
```

**Module not found?**
```typescript
// Use relative paths
import Util from '../../../src/Utils/Util.js';
```

**DB connection issues?**
```bash
rm -rf ~/.cache/mongodb-memory-server
npm install mongodb-memory-server --save-dev
```

---

**Need help?** Check `TESTING.md` for detailed documentation!
