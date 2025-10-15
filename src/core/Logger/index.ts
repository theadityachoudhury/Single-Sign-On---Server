import { logger as Logger } from './Logger.js';
import { consola } from './Consola.js';
export { requestLogger } from './requestLogger.js';

export const logger = {
    info: (msg: string, meta?: any) => {
        consola.info(msg);
        if (meta) {
            consola.info(meta);
        }
        Logger.info(msg, meta);
    },
    success: (msg: string, meta?: any) => {
        consola.success(msg);
        if (meta) {
            consola.info(meta);
        }
        Logger.info(msg, meta);
    },
    warn: (msg: string, meta?: any) => {
        consola.warn(msg);
        if (meta) {
            consola.info(meta);
        }
        Logger.warn(msg, meta);
    },
    error: (msg: string, meta?: any) => {
        consola.error(msg);
        if (meta) {
            consola.info(meta);
        }
        Logger.error(msg, meta);
    },
    debug: (msg: string, meta?: any) => {
        consola.info(msg);
        if (meta) {
            consola.info(meta);
        }
        Logger.info(msg, meta);
    },
};
