import { DatabaseConfig } from '@/config/database.config';
import mongoose from 'mongoose';

export class MongoDBConnection {
    private static instance: MongoDBConnection;

    private constructor() { }

    static getInstance(): MongoDBConnection {
        if (!MongoDBConnection.instance) {
            MongoDBConnection.instance = new MongoDBConnection();
        }
        return MongoDBConnection.instance;
    }

    async connect(config: DatabaseConfig['mongodb']): Promise<void> {
        if (!config) throw new Error('MongoDB config is required');

        try {
            await mongoose.connect(config.uri, {
                dbName: config.dbName,
                ...config.options
            });
            console.log('✅ MongoDB connected successfully');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected');
    }

    getConnection(): typeof mongoose {
        if (mongoose.connection.readyState === 0) {
            throw new Error('MongoDB not connected. Call connect() first.');
        }
        return mongoose;
    }

    async healthCheck(): Promise<boolean> {
        try {
            return mongoose.connection.readyState === 1;
        } catch {
            return false;
        }
    }
}