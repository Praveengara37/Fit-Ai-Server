import { Router } from 'express';
import { StepsController } from '../controllers/StepsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import {
    logStepsSchema,
    getHistorySchema,
    getStatsSchema,
    updateStepsSchema
} from '../validators/stepsValidators';

export const createStepsRoutes = (stepsController: StepsController): Router => {
    const router = Router();

    // All step routes require authentication
    router.use(authMiddleware);

    /**
     * POST /api/steps/log
     * Log daily steps
     */
    router.post('/log', validate(logStepsSchema), stepsController.logSteps);

    /**
     * GET /api/steps/today
     * Get today's steps and progress
     */
    router.get('/today', stepsController.getTodaySteps);

    /**
     * GET /api/steps/history
     * Get step history for a date range
     */
    router.get('/history', validate(getHistorySchema, 'query'), stepsController.getHistory);

    /**
     * GET /api/steps/stats
     * Get step statistics for a specific period
     */
    router.get('/stats', validate(getStatsSchema, 'query'), stepsController.getStats);

    /**
     * PATCH /api/steps/:id
     * Update a specific step entry
     */
    router.patch('/:id', validate(updateStepsSchema), stepsController.updateSteps);

    /**
     * DELETE /api/steps/:id
     * Delete a specific step entry
     */
    router.delete('/:id', stepsController.deleteSteps);

    return router;
};
