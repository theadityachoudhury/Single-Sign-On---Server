import { Pool } from 'pg';
import { DatabaseConfig } from '@/config/database.config';

export class PostgreSQLConnection {
    private static instance: PostgreSQLConnection;
    private pool: Pool | null = null;

    private constructor() { }

    static getInstance(): PostgreSQLConnection {
        if (!PostgreSQLConnection.instance) {
            PostgreSQLConnection.instance = new PostgreSQLConnection();
        }
        return PostgreSQLConnection.instance;
    }

    async connect(config: DatabaseConfig['postgresql']): Promise<void> {
        if (!config) throw new Error('PostgreSQL config is required');

        try {
            this.pool = new Pool({
                host: config.host,
                port: config.port,
                user: config.username,
                password: config.password,
                database: config.database,
                ssl: config.ssl
            });

            // Test connection
            const client = await this.pool.connect();
            client.release();

            console.log('✅ PostgreSQL connected successfully');
        } catch (error) {
            console.error('❌ PostgreSQL connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✅ PostgreSQL disconnected');
        }
    }

    getPool(): Pool {
        if (!this.pool) {
            throw new Error('PostgreSQL not connected. Call connect() first.');
        }
        return this.pool;
    }

    async healthCheck(): Promise<boolean> {
        try {
            if (!this.pool) return false;
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch {
            return false;
        }
    }
}