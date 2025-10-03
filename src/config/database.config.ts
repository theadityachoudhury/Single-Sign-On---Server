export interface DatabaseConfig {
    isUsingDatabase: boolean;
    type: 'mongodb' | 'postgresql';
    mongodb?: {
        uri: string;
        dbName: string;
        options?: any;
    };
    postgresql?: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl?: boolean;
    };
}

export const databaseConfig: DatabaseConfig = {
    isUsingDatabase: process.env.DATABASE_TYPE ? true : false,
    type: (process.env.DATABASE_TYPE as 'mongodb' | 'postgresql') || 'mongodb',
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'myapp',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    postgresql: {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432'),
        username: process.env.PG_USERNAME || 'postgres',
        password: process.env.PG_PASSWORD || 'password',
        database: process.env.PG_DATABASE || 'myapp',
        ssl: process.env.PG_SSL === 'true'
    }
};