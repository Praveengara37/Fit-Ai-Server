export type StatsPeriod = 'week' | 'month' | 'year';

export type LogStepsData = {
    userId: string;
    date: Date;
    steps: number;
    distanceKm?: number;
    caloriesBurned?: number;
};

export type UpdateStepsData = {
    steps?: number;
    distanceKm?: number;
    caloriesBurned?: number;
};

export type StepsStats = {
    totalSteps: number;
    averageSteps: number;
    totalDistanceKm: number;
    totalCalories: number;
    bestDay: {
        date: string;
        steps: number;
    } | null;
    currentStreak: number;
    daysWithActivity: number;
    goalReachedDays: number;
};
