import { console } from 'node:inspector';

/* eslint-env node */
export default async function globalTeardown() {
    const replSet = globalThis.__MONGO_REPLSET__;
    if (replSet && typeof replSet.stop === 'function') {
        try {
            await replSet.stop();
        } catch (e) {
            // Fix for ESLint no-empty-rule
            console.error('Error stopping MongoDB replica set:', e);
        }
    }
}
