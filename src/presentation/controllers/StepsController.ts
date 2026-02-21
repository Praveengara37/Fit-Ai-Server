import { Request, Response } from 'express';
import { LogSteps } from '../../application/use-cases/LogSteps';
import { GetTodaySteps } from '../../application/use-cases/GetTodaySteps';
import { GetStepsHistory } from '../../application/use-cases/GetStepsHistory';
import { GetStepsStats } from '../../application/use-cases/GetStepsStats';
import { UpdateSteps } from '../../application/use-cases/UpdateSteps';
import { DeleteSteps } from '../../application/use-cases/DeleteSteps';
import { successResponse, errorResponse } from '../../shared/utils/response';
import {
    InvalidDateError,
    FutureDateError,
    DateTooOldError,
    StepsNotFoundError,
    UnauthorizedStepsAccessError
} from '../../shared/errors/StepsErrors';

export class StepsController {
    constructor(
        private readonly logStepsUseCase: LogSteps,
        private readonly getTodayStepsUseCase: GetTodaySteps,
        private readonly getStepsHistoryUseCase: GetStepsHistory,
        private readonly getStepsStatsUseCase: GetStepsStats,
        private readonly updateStepsUseCase: UpdateSteps,
        private readonly deleteStepsUseCase: DeleteSteps
    ) { }

    logSteps = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const data = { ...req.body, userId };
            const result = await this.logStepsUseCase.execute(data);

            successResponse(res, { steps: result }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getTodaySteps = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const result = await this.getTodayStepsUseCase.execute(userId);

            successResponse(res, { steps: result }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            // Coerce limit string to number before passing
            const limitStr = req.query.limit as string;
            const limit = limitStr ? parseInt(limitStr, 10) : undefined;

            const result = await this.getStepsHistoryUseCase.execute(
                userId,
                req.query.startDate as string,
                req.query.endDate as string,
                limit
            );

            successResponse(res, result, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    getStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const period = (req.query.period as 'week' | 'month' | 'year') || 'week';
            const result = await this.getStepsStatsUseCase.execute(userId, period);

            successResponse(res, result, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    updateSteps = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const stepId = req.params.id;

            const result = await this.updateStepsUseCase.execute(stepId, userId, req.body);

            successResponse(res, { steps: result }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    deleteSteps = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const stepId = req.params.id;

            await this.deleteStepsUseCase.execute(stepId, userId);

            successResponse(res, { message: 'Step entry deleted successfully' }, 200);
        } catch (error: any) {
            this.handleError(res, error);
        }
    };

    private handleError(res: Response, error: any) {
        if (error instanceof InvalidDateError || error instanceof FutureDateError || error instanceof DateTooOldError) {
            return errorResponse(res, error.message, 'VALIDATION_ERROR', 400);
        }
        if (error instanceof StepsNotFoundError) {
            return errorResponse(res, error.message, 'NOT_FOUND', 404);
        }
        if (error instanceof UnauthorizedStepsAccessError) {
            return errorResponse(res, error.message, 'FORBIDDEN', 403);
        }

        console.error('Steps processing error:', error);
        return errorResponse(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
}
