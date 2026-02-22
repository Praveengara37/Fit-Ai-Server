import { IMealRepository } from '../../domain/interfaces/IMealRepository';
import { Meal } from '../../domain/entities/Meal';
import { NutritionTotals } from '../../shared/types/meal.types';

interface DayEntry {
    date: string;
    meals: Meal[];
    totals: NutritionTotals;
}

export class GetMealHistory {
    constructor(private readonly mealRepository: IMealRepository) { }

    async execute(userId: string, startDateStr?: string, endDateStr?: string) {
        // 1. Determine date range (default: 7 days)
        const endDate = endDateStr ? new Date(endDateStr) : new Date();
        endDate.setUTCHours(23, 59, 59, 999);

        const startDate = startDateStr
            ? new Date(startDateStr)
            : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setUTCHours(0, 0, 0, 0);

        // 2. Validate date range (max 90 days)
        const diffDays = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays > 90) {
            throw new Error('Date range cannot exceed 90 days');
        }

        // 3. Get meals in range
        const meals = await this.mealRepository.getMealHistory(userId, startDate, endDate);

        // 4. Group by date
        const groupedByDate = new Map<string, Meal[]>();
        for (const meal of meals) {
            const dateStr = meal.date.toISOString().split('T')[0];
            if (!groupedByDate.has(dateStr)) {
                groupedByDate.set(dateStr, []);
            }
            groupedByDate.get(dateStr)!.push(meal);
        }

        // 5. Build history with daily totals
        const history: DayEntry[] = [];
        for (const [date, dayMeals] of groupedByDate) {
            const totals = dayMeals.reduce(
                (acc, m) => ({
                    calories: acc.calories + m.totalCalories,
                    protein: acc.protein + m.totalProtein,
                    carbs: acc.carbs + m.totalCarbs,
                    fat: acc.fat + m.totalFat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );
            history.push({ date, meals: dayMeals, totals });
        }

        // Sort descending by date
        history.sort((a, b) => b.date.localeCompare(a.date));

        // 6. Calculate period stats
        const totalDays = history.length;
        const periodStats = {
            totalDays,
            averageCalories: totalDays > 0
                ? Math.round(history.reduce((s, d) => s + d.totals.calories, 0) / totalDays)
                : 0,
            averageProtein: totalDays > 0
                ? Math.round(history.reduce((s, d) => s + d.totals.protein, 0) / totalDays)
                : 0,
            averageCarbs: totalDays > 0
                ? Math.round(history.reduce((s, d) => s + d.totals.carbs, 0) / totalDays)
                : 0,
            averageFat: totalDays > 0
                ? Math.round(history.reduce((s, d) => s + d.totals.fat, 0) / totalDays)
                : 0,
            totalCalories: Math.round(history.reduce((s, d) => s + d.totals.calories, 0)),
        };

        return { history, periodStats };
    }
}
