import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { NutritionGoals } from '../../domain/entities/Meal';
import { NutritionGoalsData } from '../../shared/types/meal.types';

export class SetNutritionGoals {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(userId: string, data: NutritionGoalsData): Promise<NutritionGoals> {
        return this.mealRepository.setNutritionGoals(userId, data);
    }
}
