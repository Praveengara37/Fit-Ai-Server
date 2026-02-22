import { Request, Response } from 'express';
import { SearchFoods } from '../../application/use-cases/SearchFoods';
import { GetFoodDetails } from '../../application/use-cases/GetFoodDetails';
import { successResponse, errorResponse } from '../../shared/utils/response';
import {
    FoodSearchError,
    FoodNotFoundError,
    FatSecretApiError,
} from '../../shared/errors/MealErrors';

export class FoodController {
    constructor(
        private readonly searchFoodsUseCase: SearchFoods,
        private readonly getFoodDetailsUseCase: GetFoodDetails
    ) { }

    searchFoods = async (req: Request, res: Response): Promise<void> => {
        try {
            const query = req.query.query as string;
            const maxResults = req.query.maxResults
                ? parseInt(req.query.maxResults as string, 10)
                : undefined;

            const result = await this.searchFoodsUseCase.execute(query, maxResults);

            successResponse(res, result, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getFoodDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const { foodId } = req.params;

            const food = await this.getFoodDetailsUseCase.execute(foodId);

            successResponse(res, { food }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    private handleError(res: Response, error: any) {
        if (error instanceof FoodNotFoundError) {
            return errorResponse(res, error.message, 'NOT_FOUND', 404);
        }
        if (error instanceof FoodSearchError) {
            return errorResponse(res, error.message, 'FOOD_SEARCH_ERROR', 503);
        }
        if (error instanceof FatSecretApiError) {
            return errorResponse(res, error.message, 'API_ERROR', 503);
        }

        console.error('Food controller error:', error);
        return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
}
