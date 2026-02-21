export class StepsErrors {
    static INVALID_DATE = 'INVALID_DATE';
    static FUTURE_DATE = 'FUTURE_DATE';
    static DATE_TOO_OLD = 'DATE_TOO_OLD';
    static STEPS_NOT_FOUND = 'STEPS_NOT_FOUND';
    static UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS';
}

export class InvalidDateError extends Error {
    constructor(message: string = 'Invalid date format') {
        super(message);
        this.name = 'InvalidDateError';
    }
}

export class FutureDateError extends Error {
    constructor(message: string = 'Cannot log steps for a future date') {
        super(message);
        this.name = 'FutureDateError';
    }
}

export class DateTooOldError extends Error {
    constructor(message: string = 'Cannot log steps older than 7 days') {
        super(message);
        this.name = 'DateTooOldError';
    }
}

export class StepsNotFoundError extends Error {
    constructor(message: string = 'Steps entry not found') {
        super(message);
        this.name = 'StepsNotFoundError';
    }
}

export class UnauthorizedStepsAccessError extends Error {
    constructor(message: string = 'You do not have permission to access these steps') {
        super(message);
        this.name = 'UnauthorizedStepsAccessError';
    }
}
