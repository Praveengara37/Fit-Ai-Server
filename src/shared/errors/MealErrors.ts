export class MealNotFoundError extends Error {
    constructor(message: string = 'Meal not found') {
        super(message);
        this.name = 'MealNotFoundError';
    }
}

export class UnauthorizedMealAccessError extends Error {
    constructor(message: string = 'You do not have permission to access this meal') {
        super(message);
        this.name = 'UnauthorizedMealAccessError';
    }
}

export class FoodSearchError extends Error {
    constructor(message: string = 'Error searching for foods') {
        super(message);
        this.name = 'FoodSearchError';
    }
}

export class FatSecretApiError extends Error {
    constructor(message: string = 'FatSecret API error') {
        super(message);
        this.name = 'FatSecretApiError';
    }
}

export class InvalidMealDataError extends Error {
    constructor(message: string = 'Invalid meal data') {
        super(message);
        this.name = 'InvalidMealDataError';
    }
}

export class FoodNotFoundError extends Error {
    constructor(message: string = 'Food not found') {
        super(message);
        this.name = 'FoodNotFoundError';
    }
}
