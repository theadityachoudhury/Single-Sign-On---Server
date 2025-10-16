import { Request, Response, NextFunction } from 'express';
import { logger } from '@/Logger/Logger.js';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';

/**
 * Base Application Error class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        details?: unknown
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad Request', details?: unknown) {
        super(message, 400, true, details);
    }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', details?: unknown) {
        super(message, 401, true, details);
    }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', details?: unknown) {
        super(message, 403, true, details);
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource Not Found', details?: unknown) {
        super(message, 404, true, details);
    }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Conflict', details?: unknown) {
        super(message, 409, true, details);
    }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
    constructor(message: string = 'Validation Error', details?: unknown) {
        super(message, 422, true, details);
    }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends AppError {
    constructor(message: string = 'Too Many Requests', details?: unknown) {
        super(message, 429, true, details);
    }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Internal Server Error', details?: unknown) {
        super(message, 500, false, details);
    }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Service Unavailable', details?: unknown) {
        super(message, 503, true, details);
    }
}

/**
 * Error response interface
 */
interface ErrorResponse {
    success: false;
    error: {
        message: string;
        statusCode: number;
        details?: unknown;
        stack?: string;
    };
    timestamp: string;
    path: string;
}

/**
 * Format Zod validation errors
 */
const formatZodError = (error: ZodError) => {
    return error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
    }));
};

/**
 * Format Mongoose validation errors
 */
const formatMongooseError = (
    error: MongooseError & { errors?: Record<string, { message: string }> }
) => {
    if (error.name === 'ValidationError' && error.errors) {
        return Object.values(error.errors).map(err => ({
            field: err.message.split(':')[0]?.trim() || 'unknown',
            message: err.message,
        }));
    }
    return undefined;
};

/**
 * Determine if error should be logged
 */
const shouldLogError = (statusCode: number): boolean => {
    // Log server errors (5xx) and authentication/authorization errors
    return statusCode >= 500 || statusCode === 401 || statusCode === 403;
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void => {
    const error = err;
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details: unknown = undefined;

    // Handle AppError instances
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    // Handle Zod validation errors
    else if (error instanceof ZodError) {
        statusCode = 422;
        message = 'Validation Error';
        details = formatZodError(error);
    }
    // Handle Mongoose errors
    else if (error instanceof MongooseError) {
        if (error.name === 'ValidationError') {
            statusCode = 422;
            message = 'Validation Error';
            details = formatMongooseError(error);
        } else if (error.name === 'CastError') {
            statusCode = 400;
            message = 'Invalid ID format';
        } else if (
            error.name === 'MongoServerError' &&
            (error as { code?: number }).code === 11000
        ) {
            statusCode = 409;
            message = 'Duplicate key error';
            details = {
                duplicateField: (error as { keyValue?: Record<string, unknown> }).keyValue,
            };
        } else {
            statusCode = 500;
            message = 'Database Error';
        }
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Handle syntax errors (malformed JSON)
    else if (error instanceof SyntaxError && 'body' in error) {
        statusCode = 400;
        message = 'Malformed JSON';
    }

    // Log error if necessary
    if (shouldLogError(statusCode)) {
        logger.error({
            message: error.message,
            statusCode,
            stack: error.stack,
            path: req.path,
            method: req.method,
            ip: req.ip,
            userId: (req as Request & { user?: { id: string } }).user?.id,
        });
    }

    // Prepare error response
    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            message,
            statusCode,
            ...(details !== undefined && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        timestamp: new Date().toISOString(),
        path: req.path,
    };

    // Send response
    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
    next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (): void => {
    process.on('uncaughtException', (error: Error) => {
        logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
            error: error.message,
            stack: error.stack,
        });

        // Exit process
        process.exit(1);
    });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (): void => {
    process.on('unhandledRejection', (reason: Error) => {
        logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
            error: reason.message,
            stack: reason.stack,
        });

        // Exit process
        process.exit(1);
    });
};

/**
 * Initialize global error handlers
 */
export const initializeErrorHandlers = (): void => {
    handleUncaughtException();
    handleUnhandledRejection();
};
