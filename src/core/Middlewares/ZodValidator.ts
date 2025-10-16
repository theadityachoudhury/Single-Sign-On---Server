import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { asyncHandler } from './ErrorHandler.js';

export type ValidationTarget = 'body' | 'query' | 'params' | 'headers';

interface ValidatorConfig {
    target?: ValidationTarget;
    passthrough?: boolean; // Allow extra properties not in schema
}

/**
 * Zod validation middleware factory
 * Validates request data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param config - Optional configuration
 * @returns Express middleware function
 *
 * @example
 * // Validate request body
 * router.post('/endpoint', ZodValidator(mySchema), controller);
 *
 * @example
 * // Validate query parameters
 * router.get('/endpoint', ZodValidator(mySchema, { target: 'query' }), controller);
 */
export const ZodValidator = (schema: ZodSchema, config: ValidatorConfig = {}) => {
    const { target = 'body', passthrough = false } = config;

    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        // Select the appropriate schema method
        const schemaToUse =
            passthrough && 'passthrough' in schema
                ? (schema as { passthrough: () => ZodSchema }).passthrough()
                : schema;

        // Parse and validate the target data
        const parsedData = await schemaToUse.parseAsync(req[target]);

        // Replace the request data with parsed/sanitized data
        (req as unknown as Record<string, unknown>)[target] = parsedData;

        next();
    });
};

/**
 * Validate multiple parts of the request
 *
 * @example
 * router.post('/endpoint',
 *   ZodValidateMultiple({
 *     body: bodySchema,
 *     query: querySchema,
 *     params: paramsSchema
 *   }),
 *   controller
 * );
 */
export const ZodValidateMultiple = (schemas: Partial<Record<ValidationTarget, ZodSchema>>) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const validationPromises: Promise<void>[] = [];
        const errors: ZodError[] = [];

        for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
            validationPromises.push(
                schema
                    .parseAsync(req[target])
                    .then((parsedData: unknown) => {
                        (req as unknown as Record<string, unknown>)[target] = parsedData;
                    })
                    .catch((error: ZodError) => {
                        errors.push(error);
                    })
            );
        }

        await Promise.all(validationPromises);

        if (errors.length > 0) {
            // Combine all errors
            const combinedError = new ZodError(errors.flatMap(error => error.issues));
            throw combinedError;
        }

        next();
    });
};

export default ZodValidator;
