import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { promisify } from 'util';
import argon2 from 'argon2';

const scrypt = promisify(crypto.scrypt);
const pbkdf2 = promisify(crypto.pbkdf2);

export type HashMethod = 'bcrypt' | 'scrypt' | 'pbkdf2' | 'argon2';

export default class SecretUtils {
    private static readonly HASH_METHODS: HashMethod[] = ['bcrypt', 'scrypt', 'pbkdf2', 'argon2'];
    private static readonly SALT_ROUNDS = 10;
    private static readonly SCRYPT_KEY_LENGTH = 64;
    private static readonly PBKDF2_ITERATIONS = 100000;
    private static readonly PBKDF2_KEY_LENGTH = 64;
    private static readonly PBKDF2_DIGEST = 'sha512';

    // Argon2 configuration (RECOMMENDED for user passwords, NOT for OAuth secrets)
    private static readonly ARGON2_MEMORY_COST = 65536; // 64 MiB
    private static readonly ARGON2_TIME_COST = 3; // iterations
    private static readonly ARGON2_PARALLELISM = 4; // threads

    /**
     * Generate a random secret of specified length
     * @param length - Desired length of the secret (optional, defaults to UUID v4)
     * @returns Random secret string
     */
    static generateRandomSecret(length?: number): string {
        if (length) {
            const bytes = crypto.randomBytes(Math.ceil(length * 0.75)); // Base64 expansion factor
            return bytes
                .toString('base64')
                .replace(/[+/=]/g, '') // Remove non-alphanumeric chars
                .substring(0, length);
        }
        return v4();
    }

    /**
     * Hash a secret using specified method
     * @param secret - Plain text secret to hash
     * @param method - Hashing method to use (default: 'bcrypt')
     *
     * RECOMMENDED USAGE:
     * - 'bcrypt' (default): OAuth client secrets, API keys (high-entropy, system-generated)
     * - 'argon2': User passwords (low-entropy, user-generated)
     * - 'scrypt': Alternative to Argon2 for user passwords
     * - 'pbkdf2': Legacy compatibility only
     *
     * @returns Hashed secret with method prefix
     */
    static async hashSecret(secret: string, method: HashMethod = 'bcrypt'): Promise<string> {
        if (!secret || secret.trim().length === 0) {
            throw new Error('Secret cannot be empty');
        }

        switch (method) {
            case 'bcrypt':
                return await this.hashWithBcrypt(secret);

            case 'scrypt':
                return await this.hashWithScrypt(secret);

            case 'pbkdf2':
                return await this.hashWithPbkdf2(secret);

            case 'argon2':
                return await this.hashWithArgon2(secret);

            default:
                throw new Error(`Unsupported hash method: ${method}`);
        }
    }

    /**
     * Verify a secret against a hash
     * @param secret - Plain text secret to verify
     * @param hash - Hashed secret to compare against
     * @returns True if secret matches hash, false otherwise
     */
    static async verifySecret(secret: string, hash: string): Promise<boolean> {
        if (!secret || !hash) {
            return false;
        }

        try {
            if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
                return await bcrypt.compare(secret, hash);
            } else if (hash.startsWith('$argon2')) {
                // Argon2 hash (starts with $argon2id$, $argon2i$, or $argon2d$)
                return await this.verifyWithArgon2(secret, hash);
            } else if (hash.startsWith('scrypt:')) {
                return await this.verifyWithScrypt(secret, hash);
            } else if (hash.startsWith('pbkdf2:')) {
                return await this.verifyWithPbkdf2(secret, hash);
            } else {
                return await bcrypt.compare(secret, hash);
            }
        } catch {
            return false;
        }
    }

    /**
     * Generate a hint from a secret (shows only last 4 characters)
     * @param clientSecret - Secret to generate hint from
     * @returns Masked secret with last 4 chars visible
     * @example
     * UUID format: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4" → "********-****-****-****-********m3n4"
     * Plain format: "aB3dE5fG7hI9jK1l" → "************jK1l"
     */
    static generateSecretHint(clientSecret: string, visibleChars: number = 4): string {
        if (!clientSecret || clientSecret.length <= visibleChars) {
            return '*'.repeat(clientSecret?.length || 0);
        }

        if (clientSecret.includes('-')) {
            return clientSecret
                .split('-')
                .map((segment, index, arr) => {
                    if (index !== arr.length - 1) {
                        return '*'.repeat(segment.length);
                    }
                    const maskLength = Math.max(0, segment.length - visibleChars);
                    return (
                        '*'.repeat(maskLength) + segment.substring(segment.length - visibleChars)
                    );
                })
                .join('-');
        } else {
            const maskLength = clientSecret.length - visibleChars;
            return (
                '*'.repeat(maskLength) + clientSecret.substring(clientSecret.length - visibleChars)
            );
        }
    }

    private static async hashWithBcrypt(secret: string): Promise<string> {
        return await bcrypt.hash(secret, this.SALT_ROUNDS);
    }

    private static async hashWithScrypt(secret: string): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const derivedKey = (await scrypt(secret, salt, this.SCRYPT_KEY_LENGTH)) as Buffer;
        return `scrypt:${salt}:${derivedKey.toString('hex')}`;
    }

    private static async hashWithPbkdf2(secret: string): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const derivedKey = (await pbkdf2(
            secret,
            salt,
            this.PBKDF2_ITERATIONS,
            this.PBKDF2_KEY_LENGTH,
            this.PBKDF2_DIGEST
        )) as Buffer;
        return `pbkdf2:${salt}:${derivedKey.toString('hex')}`;
    }

    private static async hashWithArgon2(secret: string): Promise<string> {
        return await argon2.hash(secret, {
            type: argon2.argon2id, // Argon2id is recommended (hybrid of Argon2i and Argon2d)
            memoryCost: this.ARGON2_MEMORY_COST,
            timeCost: this.ARGON2_TIME_COST,
            parallelism: this.ARGON2_PARALLELISM,
        });
    }

    private static async verifyWithScrypt(secret: string, hash: string): Promise<boolean> {
        const [, salt, key] = hash.split(':');
        if (!salt || !key) return false;

        const derivedKey = (await scrypt(secret, salt, this.SCRYPT_KEY_LENGTH)) as Buffer;
        return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
    }

    private static async verifyWithPbkdf2(secret: string, hash: string): Promise<boolean> {
        const [, salt, key] = hash.split(':');
        if (!salt || !key) return false;

        const derivedKey = (await pbkdf2(
            secret,
            salt,
            this.PBKDF2_ITERATIONS,
            this.PBKDF2_KEY_LENGTH,
            this.PBKDF2_DIGEST
        )) as Buffer;
        return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
    }

    private static async verifyWithArgon2(secret: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, secret);
        } catch {
            return false;
        }
    }

    static getSupportedHashMethods(): HashMethod[] {
        return [...this.HASH_METHODS];
    }
}
