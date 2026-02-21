import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { getTodayDate, fillDateGaps, isValidDateRange } from '../../shared/utils/dateHelpers';
import { InvalidDateError } from '../../shared/errors/StepsErrors';

export class GetStepsHistory {
    constructor(private readonly stepsRepository: IDailyStepsRepository) { }

    async execute(userId: string, startDateStr?: string, endDateStr?: string, limit: number = 30) {
        const today = getTodayDate();

        let endDate = new Date(endDateStr ? endDateStr : today);
        let startDate = new Date(startDateStr ? startDateStr : new Date(today).setDate(today.getDate() - 7));

        // Check for NaN dates
        if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
            throw new InvalidDateError();
        }

        // Limit the range to a maximum of 90 days as per NFRs
        if (limit > 90) limit = 90;

        endDate.setUTCHours(0, 0, 0, 0);
        startDate.setUTCHours(0, 0, 0, 0);

        if (!isValidDateRange(startDate, endDate)) {
            throw new InvalidDateError('Start date must be before or equal to end date');
        }

        // Ensure distance between start and end doesn't exceed 90 days limits
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > limit) {
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - limit);
            startDate.setUTCHours(0, 0, 0, 0);
        }

        // 1. Fetch from repository
        const rawHistory = await this.stepsRepository.getStepsHistory(userId, startDate, endDate);

        // 2. Fill gaps so every day has an entry (returns desc order)
        const filledHistory = fillDateGaps(rawHistory, startDate, endDate, userId);

        // 3. Ensure we only return up to the limit
        const limitedHistory = filledHistory.slice(0, limit);

        // 4. Calculate aggregates over this fetched range
        const totalDays = limitedHistory.length;
        const totalSteps = limitedHistory.reduce((sum, entry) => sum + entry.steps, 0);
        const averageSteps = totalDays > 0 ? Math.round(totalSteps / totalDays) : 0;

        return {
            history: limitedHistory.map(entry => ({
                id: entry.id.startsWith('gap-') ? undefined : entry.id, // Hide gap pseudo-IDs
                date: entry.date.toISOString().split('T')[0],
                steps: entry.steps,
                distanceKm: entry.distanceKm ?? 0,
                caloriesBurned: entry.caloriesBurned ?? 0,
            })),
            totalDays,
            totalSteps,
            averageSteps,
        };
    }
}
