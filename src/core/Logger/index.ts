import { logger as Logger } from './Logger.js';
import { consola } from './Consola.js';
export { requestLogger } from './requestLogger.js';

export const logger = {
    info: (msg: string, meta?: any) => {
        consola.info(msg);
        Logger.info(msg, meta);
    },
    success: (msg: string, meta?: any) => {
        consola.success(msg);
        Logger.info(msg, meta);
    },
    warn: (msg: string, meta?: any) => {
        consola.warn(msg);
        Logger.warn(msg, meta);
    },
    error: (msg: string, meta?: any) => {
        consola.error(msg);
        Logger.error(msg, meta);
    },
    debug: (msg: string, meta?: any) => {
        consola.debug(msg);
        Logger.debug(msg, meta);
    },
};
