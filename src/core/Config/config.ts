import { logger } from '@/Logger/index.js';
import { config } from 'dotenv';
import { z } from 'zod';

config();

// Transform comma-separated origins into an array
const stringToArray = (val?: string) => (val ? val.split(',').map(v => v.trim()) : []);

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    TZ: z.string().default('Asia/Kolkata'),
    PORT: z.coerce.number().default(4000),

    // JWT
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRE: z.string().default('1d'),
    REFRESH_TOKEN_SECRET: z.string().default('refreshsecret'),
    REFRESH_TOKEN_EXPIRE: z.string().default('7d'),

    // CORS
    ALLOWED_ORIGINS: z
        .string()
        .transform(val => stringToArray(val))
        .default(['http://localhost:5173']),

    // Database
    DATABASE_URL: z.string().optional(),
    MONGO_URI: z.string().optional(),
    REDIS_URL: z.string().optional(),

    // Mail
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().optional(),

    // Cloud
    CLOUD_PROVIDER: z.string().optional(),
    CLOUD_BUCKET: z.string().optional(),
    CLOUD_REGION: z.string().optional(),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

    // Misc
    API_PREFIX: z.string().default('/api'),
    RATE_LIMIT_WINDOW: z.string().default('15m'),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    logger.error('❌ Invalid environment variables:');
    logger.error('', parsed.error.format());
    process.exit(1);
}

export default parsed.data;
