import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

/**
 * JWT payload interface
 */
export interface JwtPayload {
    userId: string;
    email: string;
}

/**
 * Generate a JWT token
 * @param payload - User data to encode in token
 * @returns Signed JWT token
 */
export const generateToken = (payload: object): string => {
    return jwt.sign(payload, config.JWT_SECRET as jwt.Secret, {
        expiresIn: config.JWT_EXPIRY as jwt.SignOptions['expiresIn'],
    });
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
};
