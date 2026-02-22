import { z } from 'zod';

export const searchFoodsSchema = z.object({
    query: z.string().min(2, 'Search query must be at least 2 characters').max(100),
    maxResults: z.coerce.number().int().min(1).max(50).optional(),
});

export const logMealSchema = z.object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    foods: z.array(
        z.object({
            foodId: z.string().nullable().optional(),
            foodName: z.string().min(1),
            brandName: z.string().nullable().optional(),
            servingSize: z.number().positive(),
            servingUnit: z.string().min(1),
            calories: z.number().min(0),
            protein: z.number().min(0),
            carbs: z.number().min(0),
            fat: z.number().min(0),
        })
    ).min(1, 'Meal must contain at least one food'),
    notes: z.string().max(500).optional(),
});

export const updateMealSchema = z.object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    foods: z.array(
        z.object({
            foodId: z.string().nullable().optional(),
            foodName: z.string().min(1),
            brandName: z.string().nullable().optional(),
            servingSize: z.number().positive(),
            servingUnit: z.string().min(1),
            calories: z.number().min(0),
            protein: z.number().min(0),
            carbs: z.number().min(0),
            fat: z.number().min(0),
        })
    ).min(1).optional(),
    notes: z.string().max(500).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export const getMealHistorySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
});

export const getMealStatsSchema = z.object({
    period: z.enum(['week', 'month', 'year']).optional().default('week'),
});

export const nutritionGoalsSchema = z.object({
    dailyCalories: z.number().int().min(1000).max(5000),
    dailyProtein: z.number().min(0).max(500),
    dailyCarbs: z.number().min(0).max(1000),
    dailyFat: z.number().min(0).max(300),
});
