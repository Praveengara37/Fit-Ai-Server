import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { Meal } from '../../domain/entities/Meal';
import { LogMealData, MealFoodData } from '../../shared/types/meal.types';
import { InvalidMealDataError } from '../../shared/errors/MealErrors';
import { isFutureDate, isDateTooOld } from '../../shared/utils/dateHelpers';

export class LogMeal {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(data: LogMealData): Promise<Meal> {
        // 1. Validate meal data
        this.validateMealData(data);

        // 2. Calculate totals
        const totals = this.calculateTotals(data.foods);

        // 3. Parse and normalize date
        const mealDate = new Date(data.date);
        mealDate.setUTCHours(0, 0, 0, 0);

        // 4. Create meal
        const meal = await this.mealRepository.createMeal({
            userId: data.userId,
            mealType: data.mealType,
            date: mealDate,
            totalCalories: totals.totalCalories,
            totalProtein: totals.totalProtein,
            totalCarbs: totals.totalCarbs,
            totalFat: totals.totalFat,
            notes: data.notes,
            foods: data.foods,
        });

        return meal;
    }

    private validateMealData(data: LogMealData): void {
        if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(data.mealType)) {
            throw new InvalidMealDataError('Invalid meal type');
        }

        if (data.foods.length === 0) {
            throw new InvalidMealDataError('Meal must contain at least one food');
        }

        const mealDate = new Date(data.date);
        if (isNaN(mealDate.getTime())) {
            throw new InvalidMealDataError('Invalid date format');
        }

        if (isFutureDate(mealDate)) {
            throw new InvalidMealDataError('Cannot log meals in the future');
        }

        if (isDateTooOld(mealDate)) {
            throw new InvalidMealDataError('Cannot log meals older than 7 days');
        }
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
