import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { getTodayDate } from '../../shared/utils/dateHelpers';
import { calculateGoalProgress } from '../../shared/utils/stepCalculations';

export class GetTodaySteps {
    constructor(private readonly stepsRepository: IDailyStepsRepository) { }

    async execute(userId: string) {
        const today = getTodayDate();
        const entry = await this.stepsRepository.getStepsByDate(userId, today);

        // Use a default goal of 10,000 steps as per PRD
        const defaultGoal = 10000;

        if (!entry) {
            return {
                id: null,
                date: today.toISOString().split('T')[0],
                steps: 0,
                distanceKm: 0,
                caloriesBurned: 0,
                goalSteps: defaultGoal,
                goalProgress: 0,
                goalReached: false,
            };
        }

        const goalProgress = calculateGoalProgress(entry.steps, defaultGoal);

        return {
            id: entry.id,
            date: entry.date.toISOString().split('T')[0],
            steps: entry.steps,
            distanceKm: entry.distanceKm ?? 0,
            caloriesBurned: entry.caloriesBurned ?? 0,
            goalSteps: defaultGoal,
            goalProgress,
            goalReached: entry.steps >= defaultGoal,
        };
    }
}
