import { z } from 'zod';

export const logStepsSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    steps: z.number().int().min(0, 'Steps cannot be negative').max(100000, 'Steps exceed reasonable limits'),
    distanceKm: z.number().min(0).max(200).optional(),
    caloriesBurned: z.number().int().min(0).max(10000).optional(),
});

export const getHistorySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
    limit: z.coerce.number().int().min(1).max(90).optional(),
});

export const getStatsSchema = z.object({
    period: z.enum(['week', 'month', 'year']).optional().default('week'),
});

export const updateStepsSchema = z.object({
    steps: z.number().int().min(0).max(100000).optional(),
    distanceKm: z.number().min(0).max(200).optional(),
    caloriesBurned: z.number().int().min(0).max(10000).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});
