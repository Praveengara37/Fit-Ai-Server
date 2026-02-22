import { Router } from 'express';
import { MealController } from '../controllers/MealController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import {
    logMealSchema,
    updateMealSchema,
    getMealHistorySchema,
    getMealStatsSchema,
} from '../validators/mealValidators';

export const createMealRoutes = (mealController: MealController): Router => {
    const router = Router();

    // All meal routes require authentication
    router.use(authMiddleware);

    /**
     * POST /api/meals/log
     * Log a new meal
     */
    router.post('/log', validate(logMealSchema), mealController.logMeal);

    /**
     * GET /api/meals/today
     * Get all meals logged today with totals and goals
     */
    router.get('/today', mealController.getTodayMeals);

    /**
     * GET /api/meals/history
     * Get meal history for a date range
     */
    router.get('/history', validate(getMealHistorySchema, 'query'), mealController.getHistory);

    /**
     * GET /api/meals/stats
     * Get nutrition statistics for a period
     */
    router.get('/stats', validate(getMealStatsSchema, 'query'), mealController.getStats);

    /**
     * PATCH /api/meals/:mealId
     * Update an existing meal
     */
    router.patch('/:mealId', validate(updateMealSchema), mealController.updateMeal);

    /**
     * DELETE /api/meals/:mealId
     * Delete a meal
     */
    router.delete('/:mealId', mealController.deleteMeal);

    return router;
};
