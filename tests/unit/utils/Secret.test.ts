import { describe, it, expect } from '@jest/globals';
import SecretUtils from '../../../src/Utils/Secret.js';

describe('SecretUtils - Unit Tests', () => {
    describe('generateRandomSecret', () => {
        it('should generate a secret of default length', () => {
            const secret = SecretUtils.generateRandomSecret();
            expect(secret).toBeDefined();
            expect(typeof secret).toBe('string');
            expect(secret.length).toBeGreaterThan(20);
        });

        it('should generate different secrets on multiple calls', () => {
            const secret1 = SecretUtils.generateRandomSecret();
            const secret2 = SecretUtils.generateRandomSecret();
            expect(secret1).not.toBe(secret2);
        });
    });

    describe('hashSecret', () => {
        it('should hash a secret successfully with default bcrypt method', async () => {
            const plainSecret = 'my-test-secret-123';
            const hashedSecret = await SecretUtils.hashSecret(plainSecret);

            expect(hashedSecret).toBeDefined();
            expect(typeof hashedSecret).toBe('string');
            expect(hashedSecret).not.toBe(plainSecret);
            expect(hashedSecret.startsWith('$2')).toBe(true); // bcrypt format
        });

        it('should produce different hashes for the same secret', async () => {
            const plainSecret = 'my-test-secret-123';
            const hash1 = await SecretUtils.hashSecret(plainSecret);
            const hash2 = await SecretUtils.hashSecret(plainSecret);

            expect(hash1).not.toBe(hash2); // Due to salt
        });

        it('should throw error for empty string', async () => {
            await expect(SecretUtils.hashSecret('')).rejects.toThrow('Secret cannot be empty');
        });

        it('should hash with argon2 method', async () => {
            const plainSecret = 'my-test-secret-123';
            const hashedSecret = await SecretUtils.hashSecret(plainSecret, 'argon2');

            expect(hashedSecret).toBeDefined();
            expect(hashedSecret.startsWith('$argon2')).toBe(true);
        });
    });

    describe('verifySecret', () => {
        it('should verify correct secret against hash', async () => {
            const plainSecret = 'my-test-secret-123';
            const hashedSecret = await SecretUtils.hashSecret(plainSecret);

            const isValid = await SecretUtils.verifySecret(plainSecret, hashedSecret);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect secret against hash', async () => {
            const plainSecret = 'my-test-secret-123';
            const wrongSecret = 'wrong-secret';
            const hashedSecret = await SecretUtils.hashSecret(plainSecret);

            const isValid = await SecretUtils.verifySecret(wrongSecret, hashedSecret);
            expect(isValid).toBe(false);
        });

        it('should return false for empty credentials', async () => {
            const isValid = await SecretUtils.verifySecret('', '');
            expect(isValid).toBe(false);
        });

        it('should verify argon2 hashed secret', async () => {
            const plainSecret = 'my-test-secret-123';
            const hashedSecret = await SecretUtils.hashSecret(plainSecret, 'argon2');

            const isValid = await SecretUtils.verifySecret(plainSecret, hashedSecret);
            expect(isValid).toBe(true);
        });
    });

    describe('generateSecretHint', () => {
        it('should generate a hint from a secret', () => {
            const secret = 'abcdef123456';
            const hint = SecretUtils.generateSecretHint(secret);

            expect(hint).toBeDefined();
            expect(typeof hint).toBe('string');
            expect(hint.length).toBeLessThanOrEqual(secret.length);
        });

        it('should show only partial secret information', () => {
            const secret = 'abcdefghijklmnop';
            const hint = SecretUtils.generateSecretHint(secret);

            expect(hint).toContain('***');
            expect(hint).not.toBe(secret);
        });

        it('should handle short secrets', () => {
            const secret = 'abc';
            const hint = SecretUtils.generateSecretHint(secret);

            expect(hint).toBeDefined();
            expect(hint).toContain('***');
        });
    });
});
