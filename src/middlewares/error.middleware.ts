import { STATUS_CODES } from '@/constants/statusCodes';
import { ApiResponse } from '@/utils/response';
import { NextFunction, Request, Response } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err: Error, req: Request, res: Response) => {
    let statusCode = res.statusCode === 200 ? STATUS_CODES.INTERNAL_SERVER_ERROR : res.statusCode;
    let message = err.message || 'Something went wrong';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = STATUS_CODES.NOT_FOUND;
    }

    // Mongoose duplicate key
    if ((err as any).code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = STATUS_CODES.BAD_REQUEST;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values((err as any).errors)
            .map((val: any) => val.message)
            .join(', ');
        statusCode = STATUS_CODES.BAD_REQUEST;
    }

    ApiResponse.error(res, message, statusCode);
};
