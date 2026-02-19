import { Response } from 'express';
import { config } from '../../config/env';

/**
 * Cookie options with security settings
 */
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
};

/**
 * Set authentication cookie in response
 * @param res - Express response object
 * @param token - JWT token to set in cookie
 */
export const setAuthCookie = (res: Response, token: string): void => {
    res.cookie(config.COOKIE_NAME, token, COOKIE_OPTIONS);
};

/**
 * Clear authentication cookie from response
 * @param res - Express response object
 */
export const clearAuthCookie = (res: Response): void => {
    res.clearCookie(config.COOKIE_NAME, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });
};
