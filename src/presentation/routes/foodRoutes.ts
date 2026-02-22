import { Router } from 'express';
import { FoodController } from '../controllers/FoodController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import { searchFoodsSchema } from '../validators/mealValidators';

export const createFoodRoutes = (foodController: FoodController): Router => {
    const router = Router();

    // All food routes require authentication
    router.use(authMiddleware);

    /**
     * GET /api/foods/search
     * Search for foods via FatSecret API
     */
    router.get('/search', validate(searchFoodsSchema, 'query'), foodController.searchFoods);

    /**
     * GET /api/foods/:foodId
     * Get detailed food info by FatSecret food ID
     */
    router.get('/:foodId', foodController.getFoodDetails);

    return router;
};
