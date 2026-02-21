import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { StatsPeriod, StepsStats } from '../../shared/types/steps.types';
import { getTodayDate } from '../../shared/utils/dateHelpers';
import { calculateStreak } from '../../shared/utils/stepCalculations';

export class GetStepsStats {
    constructor(private readonly stepsRepository: IDailyStepsRepository) { }

    async execute(userId: string, period: StatsPeriod): Promise<{ period: StatsPeriod, stats: StepsStats }> {
        const today = getTodayDate();
        let startDate = new Date(today);

        // Determine start date based on period
        switch (period) {
            case 'week':
                startDate.setDate(today.getDate() - 6); // Last 7 days including today
                break;
            case 'month':
                startDate.setDate(today.getDate() - 29); // Last 30 days including today
                break;
            case 'year':
                startDate.setDate(today.getDate() - 364); // Last 365 days including today
                break;
        }

        // Ensure boundaries are clean
        startDate.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);

        // Fetch all history for period (returns ordered desc by date)
        const history = await this.stepsRepository.getStepsHistory(userId, startDate, today);

        // Calculate Stats
        let totalSteps = 0;
        let totalDistanceKm = 0;
        let totalCalories = 0;
        let daysWithActivity = 0;
        let goalReachedDays = 0;
        let bestDay = { date: '', steps: 0 };
        const defaultGoal = 10000; // default for now

        for (const entry of history) {
            totalSteps += entry.steps;
            totalDistanceKm += (entry.distanceKm ?? 0);
            totalCalories += (entry.caloriesBurned ?? 0);

            if (entry.steps > 0) {
                daysWithActivity++;
            }

            if (entry.steps >= defaultGoal) {
                goalReachedDays++;
            }

            if (entry.steps > bestDay.steps) {
                bestDay = {
                    date: entry.date.toISOString().split('T')[0],
                    steps: entry.steps
                };
            }
        }

        const totalDaysInPeriod = period === 'week' ? 7 : (period === 'month' ? 30 : 365);
        const averageSteps = totalDaysInPeriod > 0 ? Math.round(totalSteps / totalDaysInPeriod) : 0;

        // Calculate streak
        // We fetch 90 days history to ensure we can calculate a long streak even if checking weekly stats
        const extendedStart = new Date(today);
        extendedStart.setDate(today.getDate() - 90);
        const streakHistory = await this.stepsRepository.getStepsHistory(userId, extendedStart, today);

        const currentStreak = calculateStreak(streakHistory, today);

        return {
            period,
            stats: {
                totalSteps,
                averageSteps,
                totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
                totalCalories: Math.round(totalCalories),
                bestDay: bestDay.date ? bestDay : null,
                currentStreak,
                daysWithActivity,
                goalReachedDays,
            }
        };
    }
}
