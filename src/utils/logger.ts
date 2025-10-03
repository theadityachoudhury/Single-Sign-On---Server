import { consola } from 'consola';
import fs from 'fs';
import path from 'path';
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { config } from '@/config';

// Configure consola globally
consola.options.formatOptions.date = true;
consola.options.formatOptions.colors = true;

// Override global console
(global as any).console = consola;

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for file logs
const fileFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        return log;
    })
);

// Create Winston logger
const winstonLogger = createLogger({
    level: config.NODE_ENV === 'development' ? 'debug' : 'info',
    format: fileFormat,
    transports: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '30d',
            zippedArchive: true,
        }),
    ],
});

// Custom logger that combines Winston (file) + Consola (console)
class Logger {
    private writeToFile(level: string, message: string, meta?: unknown): void {
        winstonLogger.log(level, message, meta);
    }

    info(message: string, meta?: unknown): void {
        consola.info(message, meta ?? '');
        this.writeToFile('info', message, meta);
    }

    success(message: string, meta?: unknown): void {
        consola.success(message, meta ?? '');
        this.writeToFile('info', `SUCCESS: ${message}`, meta);
    }

    warn(message: string, meta?: unknown): void {
        consola.warn(message, meta ?? '');
        this.writeToFile('warn', message, meta);
    }

    error(message: string, meta?: unknown): void {
        consola.error(message, meta ?? '');
        this.writeToFile('error', message, meta);
    }

    debug(message: string, meta?: unknown): void {
        if (config.NODE_ENV === 'development') {
            consola.debug(message, meta ?? '');
            this.writeToFile('debug', message, meta);
        }
    }

    fatal(message: string, meta?: unknown): void {
        consola.fatal(message, meta ?? '');
        this.writeToFile('error', `FATAL: ${message}`, meta);
    }
}

export const logger = new Logger();
export { winstonLogger };
