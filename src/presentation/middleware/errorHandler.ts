import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { errorResponse } from '../../shared/utils/response';
import { logger } from '../../config/logger';

/**
 * Global error handling middleware
 * MUST be the last middleware in the chain
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    // Handle known application errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;

        // Include validation details if available
        if ('details' in err) {
            details = err.details;
        }
    }

    // Log error with stack trace (but not sensitive data)
    logger.error('Error occurred', {
        code,
        message,
        statusCode,
        method: req.method,
        path: req.path,
        ...(details && typeof details === 'object' ? { validationErrors: details } : {}),
        ...(err.stack && { stack: err.stack }),
    });

    // Send error response
    errorResponse(res, message, code, statusCode, details);
};
