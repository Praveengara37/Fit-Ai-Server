import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { errorResponse } from '../../shared/utils/response';

/**
 * Middleware to validate request against Zod schema
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate (body, query, params)
 */
export const validate = (schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const result = schema.parse(req[source]);
            req[source] = result;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                errorResponse(res, 'Validation Error', 'VALIDATION_ERROR', 400, formattedErrors);
                return;
            }
            next(error);
        }
    };
};
