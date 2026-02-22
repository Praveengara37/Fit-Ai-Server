import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { nutritionDefaults } from '../../config/fatsecret';
import { NutritionTotals } from '../../shared/types/meal.types';

export class GetTodayMeals {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(userId: string) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // 1. Get today's meals
        const meals = await this.mealRepository.getTodayMeals(userId, today);

        // 2. Calculate daily totals
        const totals: NutritionTotals = meals.reduce(
            (acc, meal) => ({
                calories: acc.calories + meal.totalCalories,
                protein: acc.protein + meal.totalProtein,
                carbs: acc.carbs + meal.totalCarbs,
                fat: acc.fat + meal.totalFat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        // 3. Get nutrition goals (or use defaults)
        const goals = await this.mealRepository.getNutritionGoals(userId);
        const goalValues: NutritionTotals = goals
            ? {
                calories: goals.dailyCalories,
                protein: goals.dailyProtein,
                carbs: goals.dailyCarbs,
                fat: goals.dailyFat,
            }
            : {
                calories: nutritionDefaults.dailyCalories,
                protein: nutritionDefaults.dailyProtein,
                carbs: nutritionDefaults.dailyCarbs,
                fat: nutritionDefaults.dailyFat,
            };

        // 4. Calculate remaining
        const remaining: NutritionTotals = {
            calories: Math.max(0, goalValues.calories - totals.calories),
            protein: Math.max(0, goalValues.protein - totals.protein),
            carbs: Math.max(0, goalValues.carbs - totals.carbs),
            fat: Math.max(0, goalValues.fat - totals.fat),
        };

        return {
            date: today.toISOString().split('T')[0],
            meals,
            totals,
            goals: goalValues,
            remaining,
        };
    }
}
