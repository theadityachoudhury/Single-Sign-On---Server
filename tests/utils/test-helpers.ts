import mongoose from 'mongoose';

/**
 * Database test utilities
 */
export class DatabaseTestUtils {
    /**
     * Clear all collections in the database
     */
    static async clearDatabase(): Promise<void> {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key]?.deleteMany({});
        }
    }

    /**
     * Drop entire database
     */
    static async dropDatabase(): Promise<void> {
        await mongoose.connection.dropDatabase();
    }

    /**
     * Close database connection
     */
    static async closeDatabase(): Promise<void> {
        await mongoose.connection.close();
    }

    /**
     * Get collection document count
     */
    static async getCollectionCount(collectionName: string): Promise<number> {
        return (await mongoose.connection.db?.collection(collectionName).countDocuments()) || 0;
    }
}

/**
 * Mock data generators
 */
export class MockDataGenerator {
    static generateRandomString(length: number = 10): string {
        return Math.random()
            .toString(36)
            .substring(2, length + 2);
    }

    static generateRandomEmail(): string {
        return `test-${this.generateRandomString(8)}@example.com`;
    }

    static generateRandomUrl(): string {
        return `https://${this.generateRandomString(8)}.example.com`;
    }

    static generateOAuthClient(overrides = {}) {
        return {
            clientName: `Test Client ${this.generateRandomString(5)}`,
            clientType: 'confidential',
            redirectUris: [this.generateRandomUrl()],
            description: 'Test OAuth client',
            ...overrides,
        };
    }
}

/**
 * Test data cleanup utilities
 */
export class TestCleanup {
    private static cleanupCallbacks: Array<() => Promise<void>> = [];

    static registerCleanup(callback: () => Promise<void>): void {
        this.cleanupCallbacks.push(callback);
    }

    static async executeCleanup(): Promise<void> {
        for (const callback of this.cleanupCallbacks) {
            await callback();
        }
        this.cleanupCallbacks = [];
    }
}
