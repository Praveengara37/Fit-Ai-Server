import { PrismaClient } from '@prisma/client';
import { DailySteps } from '../../domain/entities/DailySteps';
import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { LogStepsData, UpdateStepsData, StepsStats, StatsPeriod } from '../../shared/types/steps.types';

export class DailyStepsRepository implements IDailyStepsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async logSteps(data: LogStepsData): Promise<DailySteps> {
        // Upsert step entry
        const entry = await this.prisma.dailySteps.upsert({
            where: {
                userId_date: {
                    userId: data.userId,
                    date: data.date,
                },
            },
            update: {
                steps: data.steps,
                distanceKm: data.distanceKm,
                caloriesBurned: data.caloriesBurned,
            },
            create: {
                userId: data.userId,
                date: data.date,
                steps: data.steps,
                distanceKm: data.distanceKm,
                caloriesBurned: data.caloriesBurned,
            },
        });

        return this.mapToEntity(entry);
    }

    async getStepsByDate(userId: string, date: Date): Promise<DailySteps | null> {
        const entry = await this.prisma.dailySteps.findUnique({
            where: {
                userId_date: {
                    userId,
                    date,
                },
            },
        });

        return entry ? this.mapToEntity(entry) : null;
    }

    async getStepsHistory(userId: string, startDate: Date, endDate: Date): Promise<DailySteps[]> {
        const entries = await this.prisma.dailySteps.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        return entries.map(this.mapToEntity);
    }

    async getStepsStats(_userId: string, _period: StatsPeriod): Promise<StepsStats> {
        // We'll calculate the stats mostly in memory or the application layer,
        // but for now, we're returning the raw arrays via getStepsHistory in the use case.
        // This is a placeholder as the use-case layer is often better suited for complex business 
        // derived metrics over Prisma's basic aggregations.
        throw new Error('Not implemented directly in Repo; aggregated via GetStepsStats use case');
    }

    async updateSteps(id: string, userId: string, data: UpdateStepsData): Promise<DailySteps> {
        // The update handles checking the userId in the where clause to ensure authorization
        const entry = await this.prisma.dailySteps.update({
            where: {
                id,
                userId, // Enforce ownership
            },
            data: {
                ...data,
            },
        });

        return this.mapToEntity(entry);
    }

    async deleteSteps(id: string, userId: string): Promise<void> {
        await this.prisma.dailySteps.delete({
            where: {
                id,
                userId, // Enforce ownership
            },
        });
    }

    private mapToEntity(prismaEntry: any): DailySteps {
        return {
            id: prismaEntry.id,
            userId: prismaEntry.userId,
            date: prismaEntry.date,
            steps: prismaEntry.steps,
            distanceKm: prismaEntry.distanceKm ? Number(prismaEntry.distanceKm) : undefined,
            caloriesBurned: prismaEntry.caloriesBurned ?? undefined,
            createdAt: prismaEntry.createdAt,
            updatedAt: prismaEntry.updatedAt,
        };
    }
}
