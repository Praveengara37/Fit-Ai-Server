import { AppError } from './AppError';

/**
 * Unauthorized Error (401)
 * Used for authentication failures
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
