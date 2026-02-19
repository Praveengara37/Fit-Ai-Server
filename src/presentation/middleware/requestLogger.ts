import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';

/**
 * Request logging middleware
 * Logs all incoming HTTP requests without sensitive data
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        logger.info('HTTP Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        });
    });

    next();
};
