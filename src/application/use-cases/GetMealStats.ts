import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { MealStatsResult, NutritionTotals } from '../../shared/types/meal.types';

type StatsPeriod = 'week' | 'month' | 'year';

export class GetMealStats {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(userId: string, period: StatsPeriod = 'week'): Promise<{ period: string; stats: MealStatsResult }> {
        // 1. Calculate date range based on period
        const endDate = new Date();
        endDate.setUTCHours(23, 59, 59, 999);

        const startDate = new Date();
        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }
        startDate.setUTCHours(0, 0, 0, 0);

        // 2. Get meals in range
        const meals = await this.mealRepository.getMealHistory(userId, startDate, endDate);

        // 3. Group by date and calculate daily totals
        const dailyTotals = new Map<string, NutritionTotals & { mealCount: number }>();
        for (const meal of meals) {
            const dateStr = meal.date.toISOString().split('T')[0];
            const existing = dailyTotals.get(dateStr) || { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 };
            existing.calories += meal.totalCalories;
            existing.protein += meal.totalProtein;
            existing.carbs += meal.totalCarbs;
            existing.fat += meal.totalFat;
            existing.mealCount += 1;
            dailyTotals.set(dateStr, existing);
        }

        const daysLogged = dailyTotals.size;
        const totalMeals = meals.length;

        // 4. Calculate aggregates
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let highestCalorieDay: { date: string; calories: number } | null = null;
        let lowestCalorieDay: { date: string; calories: number } | null = null;

        for (const [date, totals] of dailyTotals) {
            totalCalories += totals.calories;
            totalProtein += totals.protein;
            totalCarbs += totals.carbs;
            totalFat += totals.fat;

            if (!highestCalorieDay || totals.calories > highestCalorieDay.calories) {
                highestCalorieDay = { date, calories: Math.round(totals.calories) };
            }
            if (!lowestCalorieDay || totals.calories < lowestCalorieDay.calories) {
                lowestCalorieDay = { date, calories: Math.round(totals.calories) };
            }
        }

        const stats: MealStatsResult = {
            totalCalories: Math.round(totalCalories),
            averageCalories: daysLogged > 0 ? Math.round(totalCalories / daysLogged) : 0,
            totalProtein: Math.round(totalProtein),
            averageProtein: daysLogged > 0 ? Math.round(totalProtein / daysLogged) : 0,
            totalCarbs: Math.round(totalCarbs),
            averageCarbs: daysLogged > 0 ? Math.round(totalCarbs / daysLogged) : 0,
            totalFat: Math.round(totalFat),
            averageFat: daysLogged > 0 ? Math.round(totalFat / daysLogged) : 0,
            daysLogged,
            totalMeals,
            averageMealsPerDay: daysLogged > 0 ? Math.round(totalMeals / daysLogged) : 0,
            highestCalorieDay,
            lowestCalorieDay,
        };

        return { period, stats };
    }
}
