export interface DailySteps {
    id: string;
    userId: string;
    date: Date;
    steps: number;
    distanceKm?: number;
    caloriesBurned?: number;
    createdAt: Date;
    updatedAt: Date;
}
