/**
 * Middlewares Index
 * Central export point for all middleware functions
 */

export {
    // Error Classes
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    TooManyRequestsError,
    InternalServerError,
    ServiceUnavailableError,
    // Error Handler Middleware
    errorHandler,
    notFoundHandler,
    asyncHandler,
    // Global Error Handlers
    initializeErrorHandlers,
    handleUncaughtException,
    handleUnhandledRejection,
} from './ErrorHandler.js';

// Validation Middleware
export { ZodValidator, ZodValidateMultiple, type ValidationTarget } from './ZodValidator.js';
export { default as validateWith } from './ZodValidator.js';
