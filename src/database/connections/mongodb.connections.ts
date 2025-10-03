import { DatabaseConfig } from '@/config/database.config';
import { Db, MongoClient } from 'mongodb';

export class MongoDBConnection {
    private static instance: MongoDBConnection;
    private client: MongoClient | null = null;
    private db: Db | null = null;

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
            this.client = new MongoClient(config.uri, config.options);
            await this.client.connect();
            this.db = this.client.db(config.dbName);
            console.log('✅ MongoDB connected successfully');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log('✅ MongoDB disconnected');
        }
    }

    getDatabase(): Db {
        if (!this.db) {
            throw new Error('MongoDB not connected. Call connect() first.');
        }
        return this.db;
    }

    async healthCheck(): Promise<boolean> {
        try {
            if (!this.db) return false;
            await this.db.admin().ping();
            return true;
        } catch {
            return false;
        }
    }
}