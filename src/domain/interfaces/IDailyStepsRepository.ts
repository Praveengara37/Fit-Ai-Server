import { DailySteps } from '../entities/DailySteps';
import { LogStepsData, UpdateStepsData, StepsStats, StatsPeriod } from '../../shared/types/steps.types';

export interface IDailyStepsRepository {
    logSteps(data: LogStepsData): Promise<DailySteps>;
    getStepsByDate(userId: string, date: Date): Promise<DailySteps | null>;
    getStepsHistory(userId: string, startDate: Date, endDate: Date): Promise<DailySteps[]>;
    getStepsStats(userId: string, period: StatsPeriod): Promise<StepsStats>;
    updateSteps(id: string, userId: string, data: UpdateStepsData): Promise<DailySteps>;
    deleteSteps(id: string, userId: string): Promise<void>;
}
