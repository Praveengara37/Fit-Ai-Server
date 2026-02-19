import { JwtPayload } from '../utils/jwt';

/**
 * Extend Express Request interface to include user property
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export { };
