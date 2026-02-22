import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { Meal } from '../../domain/entities/Meal';
import { UpdateMealData, MealFoodData } from '../../shared/types/meal.types';
import { MealNotFoundError, InvalidMealDataError } from '../../shared/errors/MealErrors';

export class UpdateMeal {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(mealId: string, userId: string, data: UpdateMealData): Promise<Meal> {
        // 1. Verify meal exists and user owns it
        const existing = await this.mealRepository.getMealById(mealId, userId);
        if (!existing) {
            throw new MealNotFoundError();
        }

        // 2. Calculate new totals if foods are provided
        let updateData: any = {};

        if (data.mealType) {
            if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(data.mealType)) {
                throw new InvalidMealDataError('Invalid meal type');
            }
            updateData.mealType = data.mealType;
        }

        if (data.notes !== undefined) {
            updateData.notes = data.notes;
        }

        if (data.foods && data.foods.length > 0) {
            const totals = this.calculateTotals(data.foods);
            updateData = {
                ...updateData,
                ...totals,
                foods: data.foods,
            };
        }

        // 3. Update meal
        return this.mealRepository.updateMeal(mealId, userId, updateData);
    }

    private calculateTotals(foods: MealFoodData[]) {
        return foods.reduce(
            (totals, food) => ({
                totalCalories: totals.totalCalories + food.calories,
                totalProtein: totals.totalProtein + food.protein,
                totalCarbs: totals.totalCarbs + food.carbs,
                totalFat: totals.totalFat + food.fat,
            }),
            { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
        );
    }
}
