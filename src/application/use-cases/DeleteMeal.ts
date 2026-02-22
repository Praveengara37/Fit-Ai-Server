import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { MealNotFoundError } from '../../shared/errors/MealErrors';

export class DeleteMeal {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(mealId: string, userId: string): Promise<void> {
        // 1. Verify meal exists and user owns it
        const existing = await this.mealRepository.getMealById(mealId, userId);
        if (!existing) {
            throw new MealNotFoundError();
        }

        // 2. Delete meal (cascade deletes meal_foods)
        await this.mealRepository.deleteMeal(mealId, userId);
    }
}
