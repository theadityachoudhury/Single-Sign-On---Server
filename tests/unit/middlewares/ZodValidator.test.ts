import { describe, it, expect, jest } from '@jest/globals';
import { ZodValidator } from '../../../src/core/Middlewares/ZodValidator.js';
import { ZodValidateMultiple } from '../../../src/core/Middlewares/ZodValidator.js';
import z, { ZodError } from 'zod';

const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
});

// Helper to wait for asyncHandler to invoke next()
const createNextPromise = () => {
    let resolveFn: (value?: unknown) => void;
    const done = new Promise(resolve => {
        resolveFn = resolve;
    });
    const next = jest.fn((err?: unknown) => resolveFn(err));
    return { next, done } as const;
};

describe('ZodValidator middleware', () => {
    it('passes and assigns parsed data on success', async () => {
        const schema = z.object({ name: z.string(), age: z.number().int().min(0) });
        const mw = ZodValidator(schema);

        const req: any = { body: { name: 'Ada', age: 30 } };
        const res = makeRes();
        const { next, done } = createNextPromise();

        // Middleware wrapped with asyncHandler doesn't return a promise; wait for next()
        mw(req as any, res as any, next as any);
        await done;

        expect(req.body).toEqual({ name: 'Ada', age: 30 });
        expect(next).toHaveBeenCalled();
        // Should not call error response
        expect(res.status).not.toHaveBeenCalled();
    });

    it('forwards ZodError to next on validation failure', async () => {
        const schema = z.object({ name: z.string() });
        const mw = ZodValidator(schema);

        const req: any = { body: {} }; // missing name
        const res = makeRes();
        const { next, done } = createNextPromise();

        mw(req as any, res as any, next as any);
        const err = await done;

        expect(err).toBeInstanceOf(Error);
        // Do not send response directly in middleware
        expect(res.status).not.toHaveBeenCalled();
    });

    it('strips extra properties by default (no passthrough)', async () => {
        const schema = z.object({ name: z.string() });
        const mw = ZodValidator(schema);

        const req: any = { body: { name: 'Ada', extra: 'ignore' } };
        const res = makeRes();
        const { next, done } = createNextPromise();

        mw(req as any, res as any, next as any);
        await done;

        expect(req.body).toEqual({ name: 'Ada' });
    });

    it('retains extra properties when passthrough is enabled', async () => {
        const schema = z.object({ name: z.string() });
        const mw = ZodValidator(schema, { passthrough: true });

        const req: any = { body: { name: 'Ada', extra: 'keep' } };
        const res = makeRes();
        const { next, done } = createNextPromise();

        mw(req as any, res as any, next as any);
        await done;

        expect(req.body).toEqual({ name: 'Ada', extra: 'keep' });
    });

    it('ZodValidateMultiple validates body and query successfully', async () => {
        const mw = ZodValidateMultiple({
            body: z.object({ name: z.string() }),
            query: z.object({ page: z.coerce.number().int().min(1) }),
        });

        const req: any = { body: { name: 'Ada' }, query: { page: '2' } };
        const res = makeRes();
        const { next, done } = createNextPromise();

        mw(req as any, res as any, next as any);
        await done;

        expect(req.body).toEqual({ name: 'Ada' });
        expect(req.query).toEqual({ page: 2 });
    });

    it('ZodValidateMultiple aggregates errors and forwards ZodError', async () => {
        const mw = ZodValidateMultiple({
            body: z.object({ name: z.string() }),
            query: z.object({ page: z.coerce.number().int().min(1) }),
        });

        const req: any = { body: {}, query: { page: '0' } };
        const res = makeRes();
        const { next, done } = createNextPromise();

        mw(req as any, res as any, next as any);
        const err = await done;
        expect(err).toBeInstanceOf(ZodError);
    });
});
