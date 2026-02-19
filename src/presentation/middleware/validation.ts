import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../../shared/errors/BadRequestError';

/**
 * Validation source type
 */
type ValidationSource = 'body' | 'query' | 'params';

/**
 * Middleware factory for Zod validation
 * @param schema - Zod schema to validate against
 * @param source - Where to get data from (body, query, params)
 * @returns Express middleware function
 */
export const validate =
    (schema: AnyZodObject, source: ValidationSource = 'body') =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const data = req[source];
                const validated = await schema.parseAsync(data);

                // Replace request data with validated data
                req[source] = validated;

                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.errors.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    }));

                    next(new BadRequestError('Validation failed', errors));
                } else {
                    next(error);
                }
            }
        };
