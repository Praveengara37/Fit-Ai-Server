import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { DailySteps } from '../../domain/entities/DailySteps';
import { LogStepsData } from '../../shared/types/steps.types';
import { calculateDistance, calculateCalories } from '../../shared/utils/stepCalculations';
import { isFutureDate, isDateTooOld } from '../../shared/utils/dateHelpers';
import {
    FutureDateError,
    DateTooOldError,
    InvalidDateError
} from '../../shared/errors/StepsErrors';

export class LogSteps {
    constructor(private readonly stepsRepository: IDailyStepsRepository) { }

    async execute(data: LogStepsData): Promise<DailySteps> {
        // 1. Date Validation
        const inputDate = new Date(data.date);

        if (isNaN(inputDate.getTime())) {
            throw new InvalidDateError();
        }

        if (isFutureDate(inputDate)) {
            throw new FutureDateError();
        }

        if (isDateTooOld(inputDate)) {
            throw new DateTooOldError();
        }

        // 2. Data Calculation
        const steps = data.steps;
        const distanceKm = data.distanceKm ?? calculateDistance(steps);
        const caloriesBurned = data.caloriesBurned ?? calculateCalories(steps);

        // Normalize date to handle upsert properly
        inputDate.setUTCHours(0, 0, 0, 0);

        // 3. Persist
        return this.stepsRepository.logSteps({
            userId: data.userId,
            date: inputDate,
            steps,
            distanceKm,
            caloriesBurned,
        });
    }
}
