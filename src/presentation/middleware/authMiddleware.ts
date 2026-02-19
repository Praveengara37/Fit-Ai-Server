import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/jwt';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { config } from '../../config/env';

/**
 * Authentication middleware
 * CRITICAL: Reads JWT from HTTP-only cookie, NOT Authorization header
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Read token from cookie (NOT Authorization header)
        // Try to get token from cookie first (web)
        let token = req.cookies[config.COOKIE_NAME];

        // If no cookie, check Authorization header (mobile)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            throw new UnauthorizedError('Authentication required');
        }

        // Verify token
        const payload = verifyToken(token);

        // Attach user to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
        };

        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError('Invalid or expired token'));
        }
    }
};
