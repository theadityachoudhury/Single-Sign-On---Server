import { config } from '@/Config/index.js';
import mongoose, { MongooseError } from 'mongoose';

interface DBConnections {
    authDB: mongoose.Connection;
    identityDB: mongoose.Connection;
    oAuthDB: mongoose.Connection;
}

export const db: DBConnections = {
    authDB: mongoose.createConnection(config.AUTH_DB_MONGO_URI),
    identityDB: mongoose.createConnection(config.IDENTITY_DB_MONGO_URI),
    oAuthDB: mongoose.createConnection(config.OAUTH_DB_MONGO_URI),
};

// Connect all DBs
const initializeDatabase = async () => {
    try {
        await Promise.all([
            await db.authDB.asPromise(),
            db.identityDB.asPromise(),
            db.oAuthDB.asPromise(),
        ]);
        console.log('✅ All MongoDB databases connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

for (const [name, connection] of Object.entries(db)) {
    connection.on('connected', () => {
        console.log(`✅ ${name} connected`);
    });

    connection.on('error', (err: MongooseError) => {
        console.error(`❌ ${name} connection error:`, err);
    });

    connection.on('disconnected', () => {
        console.warn(`⚠️ ${name} disconnected`);
    });
}

export default initializeDatabase;
