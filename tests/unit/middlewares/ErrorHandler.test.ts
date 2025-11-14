import { describe, it, expect, jest } from '@jest/globals';
import mongoose from 'mongoose';
import {
    errorHandler,
    notFoundHandler,
    BadRequestError,
    asyncHandler,
} from '../../../src/core/Middlewares/index.js';

const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
});

const makeReq = (overrides: Partial<any> = {}) => ({
    path: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    ...overrides,
});

describe('ErrorHandler middleware', () => {
    it('formats AppError properly (400 BadRequest)', () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const err = new BadRequestError('Invalid input', { field: 'name' });

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const body = res.json.mock.calls[0][0];
        expect(body.success).toBe(false);
        expect(body.error.message).toBe('Invalid input');
        expect(body.error.statusCode).toBe(400);
    });

    it('maps SyntaxError with body to 400 Malformed JSON', () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const err: any = new SyntaxError('Unexpected token');
        err.body = '{bad json}';

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const body = res.json.mock.calls[0][0];
        expect(body.error.message).toBe('Malformed JSON');
    });

    it('notFoundHandler forwards NotFoundError to next', () => {
        const req: any = makeReq({ path: '/missing', method: 'POST' });
        const res: any = makeRes();
        const next = jest.fn();

        notFoundHandler(req, res, next);

        expect(next).toHaveBeenCalled();
        const [err] = next.mock.calls[0];
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toContain('not found');
    });

    it('asyncHandler forwards thrown errors to next', async () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const wrapped = asyncHandler(async () => {
            throw new Error('boom');
        });

        await wrapped(req, res, next);

        expect(next).toHaveBeenCalled();
        const [err] = next.mock.calls[0];
        expect((err as Error).message).toBe('boom');
    });

    it('handles Mongoose ValidationError as 422 with details', () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const valErr = new mongoose.Error.ValidationError();
        valErr.errors = {
            name: new (mongoose as any).Error.ValidatorError({
                message: 'name: required',
                path: 'name',
            }),
        };

        errorHandler(valErr as any, req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        const body = res.json.mock.calls[0][0];
        expect(body.error.message).toBe('Validation Error');
        expect(Array.isArray(body.error.details)).toBe(true);
    });

    it('handles Mongoose CastError as 400 Invalid ID format', () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const castErr = new (mongoose as any).Error.CastError('ObjectId', 'bad', 'id');
        errorHandler(castErr, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        const body = res.json.mock.calls[0][0];
        expect(body.error.message).toBe('Invalid ID format');
    });

    it('handles JWT JsonWebTokenError as 401 Invalid token', () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const jwtErr = Object.assign(new Error('jwt malformed'), { name: 'JsonWebTokenError' });
        errorHandler(jwtErr as any, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const body = res.json.mock.calls[0][0];
        expect(body.error.message).toBe('Invalid token');
    });

    it('handles JWT TokenExpiredError as 401 Token expired', () => {
        const req: any = makeReq();
        const res: any = makeRes();
        const next = jest.fn();

        const expErr = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
        errorHandler(expErr as any, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const body = res.json.mock.calls[0][0];
        expect(body.error.message).toBe('Token expired');
    });
});
