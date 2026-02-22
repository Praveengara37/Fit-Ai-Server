import { Router } from 'express';
import { NutritionController } from '../controllers/NutritionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import { nutritionGoalsSchema } from '../validators/mealValidators';

export const createNutritionRoutes = (nutritionController: NutritionController): Router => {
    const router = Router();

    // All nutrition routes require authentication
    router.use(authMiddleware);

    /**
     * POST /api/nutrition/goals
     * Set custom daily nutrition goals
     */
    router.post('/goals', validate(nutritionGoalsSchema), nutritionController.setGoals);

    /**
     * GET /api/nutrition/goals
     * Get current nutrition goals (custom or defaults)
     */
    router.get('/goals', nutritionController.getGoals);

    return router;
};
