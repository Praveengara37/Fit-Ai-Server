import { Response } from 'express';

/**
 * Send a success response
 * @param res - Express response object
 * @param data - Data to send in response
 * @param statusCode - HTTP status code (default: 200)
 */
export const successResponse = (
    res: Response,
    data: unknown,
    statusCode = 200
): Response => {
    console.log('Success Response:', data);
    return res.status(statusCode).json({
        success: true,
        data,
    });
};

/**
 * Send an error response
 * @param res - Express response object
 * @param message - Error message
 * @param code - Error code
 * @param statusCode - HTTP status code (default: 500)
 * @param details - Optional error details
 */
export const errorResponse = (
    res: Response,
    message: string,
    code: string,
    statusCode = 500,
    details?: unknown
): Response => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    });
};
