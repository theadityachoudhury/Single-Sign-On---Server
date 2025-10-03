import dotenv from 'dotenv';

dotenv.config();

export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/app',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    INTERNAL_SERVICE_NO_EXPOSURE: process.env.INTERNAL_SERVICE_NO_EXPOSURE === 'true',
};
