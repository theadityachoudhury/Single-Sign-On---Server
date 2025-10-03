import { databaseConfig } from "../config/database.config";
import { MongoDBConnection } from "./connections/mongodb.connections";
import { PostgreSQLConnection } from "./connections/postgres.connection";

export async function initializeDatabase() {
    try {
        if (databaseConfig.isUsingDatabase === false) {
            console.warn("Database is not configured. Skipping initialization.");
            return;
        }
        if (databaseConfig.type === 'mongodb') {
            await MongoDBConnection.getInstance().connect(databaseConfig.mongodb!);
        } else if (databaseConfig.type === 'postgresql') {
            await PostgreSQLConnection.getInstance().connect(databaseConfig.postgresql!);
        } else {
            throw new Error(`Unsupported database type: ${databaseConfig.type}`);
        }

    } catch (error: unknown) {
        console.error('Database initialization failed:', error);
        throw new Error('Database initialization failed');
    }
}