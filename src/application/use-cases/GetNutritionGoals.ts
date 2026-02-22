import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { NutritionGoals } from '../../domain/entities/Meal';
import { nutritionDefaults } from '../../config/fatsecret';

export class GetNutritionGoals {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(userId: string): Promise<NutritionGoals> {
        const goals = await this.mealRepository.getNutritionGoals(userId);

        if (goals) {
            return goals;
        }

        // Return defaults if no custom goals set
        return {
            id: 'default',
            userId,
            dailyCalories: nutritionDefaults.dailyCalories,
            dailyProtein: nutritionDefaults.dailyProtein,
            dailyCarbs: nutritionDefaults.dailyCarbs,
            dailyFat: nutritionDefaults.dailyFat,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
