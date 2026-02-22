import { Request, Response } from 'express';
import { LogMeal } from '../../application/use-cases/LogMeal';
import { GetTodayMeals } from '../../application/use-cases/GetTodayMeals';
import { GetMealHistory } from '../../application/use-cases/GetMealHistory';
import { GetMealStats } from '../../application/use-cases/GetMealStats';
import { UpdateMeal } from '../../application/use-cases/UpdateMeal';
import { DeleteMeal } from '../../application/use-cases/DeleteMeal';
import { successResponse, errorResponse } from '../../shared/utils/response';
import {
    MealNotFoundError,
    UnauthorizedMealAccessError,
    InvalidMealDataError,
} from '../../shared/errors/MealErrors';

export class MealController {
    constructor(
        private readonly logMealUseCase: LogMeal,
        private readonly getTodayMealsUseCase: GetTodayMeals,
        private readonly getMealHistoryUseCase: GetMealHistory,
        private readonly getMealStatsUseCase: GetMealStats,
        private readonly updateMealUseCase: UpdateMeal,
        private readonly deleteMealUseCase: DeleteMeal
    ) { }

    logMeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const meal = await this.logMealUseCase.execute({ ...req.body, userId });

            successResponse(res, { meal }, 201);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getTodayMeals = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const result = await this.getTodayMealsUseCase.execute(userId);

            successResponse(res, result, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const startDate = req.query.startDate as string | undefined;
            const endDate = req.query.endDate as string | undefined;

            const result = await this.getMealHistoryUseCase.execute(userId, startDate, endDate);

            successResponse(res, result, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const period = (req.query.period as 'week' | 'month' | 'year') || 'week';

            const result = await this.getMealStatsUseCase.execute(userId, period);

            successResponse(res, result, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    updateMeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const mealId = req.params.mealId;

            const meal = await this.updateMealUseCase.execute(mealId, userId, req.body);

            successResponse(res, { meal }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    deleteMeal = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const mealId = req.params.mealId;

            await this.deleteMealUseCase.execute(mealId, userId);

            successResponse(res, { message: 'Meal deleted successfully' }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    private handleError(res: Response, error: any) {
        if (error instanceof InvalidMealDataError) {
            return errorResponse(res, error.message, 'VALIDATION_ERROR', 400);
        }
        if (error instanceof MealNotFoundError) {
            return errorResponse(res, error.message, 'NOT_FOUND', 404);
        }
        if (error instanceof UnauthorizedMealAccessError) {
            return errorResponse(res, error.message, 'FORBIDDEN', 403);
        }

        console.error('Meal controller error:', error);
        return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
}
