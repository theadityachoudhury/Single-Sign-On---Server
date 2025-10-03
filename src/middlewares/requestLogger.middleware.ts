import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface LogData {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    userAgent?: string;
    ip: string;
    contentLength?: string;
    referer?: string;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const startHrTime = process.hrtime();

    // Capture request info
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent');
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const referer = req.get('Referer');

    // Listen to response finish event
    res.on('finish', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const [seconds, nanoseconds] = process.hrtime(startHrTime);
        const hrResponseTime = seconds * 1000 + nanoseconds / 1000000;

        const logData: LogData = {
            method,
            url,
            statusCode: res.statusCode,
            responseTime: Math.round(hrResponseTime * 100) / 100,
            userAgent,
            ip,
            contentLength: res.get('Content-Length'),
            referer,
        };

        // Determine log level based on status code
        const isSuccess = res.statusCode < 400;
        const isClientError = res.statusCode >= 400 && res.statusCode < 500;
        const isServerError = res.statusCode >= 500;

        // Create log message
        const statusIcon = isSuccess ? '✅' : isClientError ? '⚠️' : '❌';
        const colorCode = isSuccess ? '\x1b[32m' : isClientError ? '\x1b[33m' : '\x1b[31m';
        const resetColor = '\x1b[0m';

        const logMessage = `${statusIcon} ${colorCode}${method}${resetColor} ${url} - ${colorCode}${res.statusCode}${resetColor} - ${responseTime}ms`;

        // Additional context for detailed logging
        const context = {
            ...logData,
            timestamp: new Date().toISOString(),
        };

        // Log based on status
        if (isSuccess) {
            logger.info(logMessage, context);
        } else if (isClientError) {
            logger.warn(logMessage, context);
        } else if (isServerError) {
            logger.error(logMessage, context);
        }
    });

    // Listen to response close event (for aborted requests)
    res.on('close', () => {
        if (!res.headersSent) {
            const responseTime = Date.now() - startTime;
            const logMessage = `🔌 ${method} ${url} - Connection closed by client - ${responseTime}ms`;

            logger.warn(logMessage, {
                method,
                url,
                ip,
                responseTime,
                userAgent,
                timestamp: new Date().toISOString(),
                event: 'connection_closed',
            });
        }
    });

    next();
};
