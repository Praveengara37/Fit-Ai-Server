import { AppError } from './AppError';

/**
 * Not Found Error (404)
 * Used when a resource is not found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
