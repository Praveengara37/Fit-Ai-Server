import { Request, Response } from 'express';
import { SetNutritionGoals } from '../../application/use-cases/SetNutritionGoals';
import { GetNutritionGoals } from '../../application/use-cases/GetNutritionGoals';
import { successResponse, errorResponse } from '../../shared/utils/response';

export class NutritionController {
    constructor(
        private readonly setNutritionGoalsUseCase: SetNutritionGoals,
        private readonly getNutritionGoalsUseCase: GetNutritionGoals
    ) { }

    setGoals = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const goals = await this.setNutritionGoalsUseCase.execute(userId, req.body);

            successResponse(res, { goals }, 200);
        } catch (error: any) {
            console.error('Nutrition controller error:', error);
            errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
        }
    };

    getGoals = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const goals = await this.getNutritionGoalsUseCase.execute(userId);

            successResponse(res, { goals }, 200);
        } catch (error: any) {
            console.error('Nutrition controller error:', error);
            errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
        }
    };
}
