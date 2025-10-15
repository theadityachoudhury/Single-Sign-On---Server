import { NextFunction, Request, Response } from 'express';
import { logger } from '@/Logger/index.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const method = req.method;
        const url = req.originalUrl;

        if (statusCode >= 500) {
            logger.error(`${method} ${url} ${statusCode} - ${duration}ms`);
        } else if (statusCode >= 400) {
            logger.warn(`${method} ${url} ${statusCode} - ${duration}ms`);
        } else {
            logger.info(`${method} ${url} ${statusCode} - ${duration}ms`);
        }
        logger.success(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });

    next();
};
