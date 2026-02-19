import { AppError } from './AppError';

/**
 * Bad Request Error (400)
 * Used for validation errors and invalid input
 */
export class BadRequestError extends AppError {
    public readonly details?: unknown;

    constructor(message: string, details?: unknown) {
        super(message, 400, 'BAD_REQUEST');
        this.details = details;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
