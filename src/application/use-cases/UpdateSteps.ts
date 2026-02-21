import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { DailySteps } from '../../domain/entities/DailySteps';
import { UpdateStepsData } from '../../shared/types/steps.types';
import { calculateDistance, calculateCalories } from '../../shared/utils/stepCalculations';
import { StepsNotFoundError } from '../../shared/errors/StepsErrors';

export class UpdateSteps {
    constructor(private readonly stepsRepository: IDailyStepsRepository) { }

    async execute(id: string, userId: string, data: UpdateStepsData): Promise<DailySteps> {
        try {
            // Recalculate if steps are provided
            if (data.steps !== undefined) {
                if (data.distanceKm === undefined) {
                    data.distanceKm = calculateDistance(data.steps);
                }
                if (data.caloriesBurned === undefined) {
                    data.caloriesBurned = calculateCalories(data.steps);
                }
            }

            return await this.stepsRepository.updateSteps(id, userId, data);
        } catch (error: any) {
            // Prisma error standard mapping
            if (error.code === 'P2025' || error.message.includes('Record to update not found')) {
                throw new StepsNotFoundError();
            }
            throw error;
        }
    }
}
