import { PrismaClient } from '@prisma/client';
import { Meal, NutritionGoals } from '../../domain/entities/Meal';
import { IMealRepository, CreateMealInput, UpdateMealInput } from '../../domain/interfaces/IMealRepository';
import { NutritionGoalsData } from '../../shared/types/meal.types';

export class MealRepository implements IMealRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createMeal(data: CreateMealInput): Promise<Meal> {
        const entry = await this.prisma.meal.create({
            data: {
                userId: data.userId,
                mealType: data.mealType,
                date: data.date,
                totalCalories: data.totalCalories,
                totalProtein: data.totalProtein,
                totalCarbs: data.totalCarbs,
                totalFat: data.totalFat,
                notes: data.notes,
                foods: {
                    create: data.foods.map(food => ({
                        foodId: food.foodId,
                        foodName: food.foodName,
                        brandName: food.brandName,
                        servingSize: food.servingSize,
                        servingUnit: food.servingUnit,
                        calories: food.calories,
                        protein: food.protein,
                        carbs: food.carbs,
                        fat: food.fat,
                    })),
                },
            },
            include: {
                foods: true,
            },
        });

        return this.mapToEntity(entry);
    }

    async getMealById(id: string, userId: string): Promise<Meal | null> {
        const entry = await this.prisma.meal.findFirst({
            where: { id, userId },
            include: { foods: true },
        });

        return entry ? this.mapToEntity(entry) : null;
    }

    async getTodayMeals(userId: string, date: Date): Promise<Meal[]> {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const entries = await this.prisma.meal.findMany({
            where: {
                userId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { foods: true },
            orderBy: { createdAt: 'asc' },
        });

        return entries.map(e => this.mapToEntity(e));
    }

    async getMealHistory(userId: string, startDate: Date, endDate: Date): Promise<Meal[]> {
        const entries = await this.prisma.meal.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { foods: true },
            orderBy: { date: 'desc' },
        });

        return entries.map(e => this.mapToEntity(e));
    }

    async updateMeal(id: string, userId: string, data: UpdateMealInput): Promise<Meal> {
        // If foods are provided, delete existing and replace
        if (data.foods && data.foods.length > 0) {
            await this.prisma.mealFood.deleteMany({
                where: { mealId: id },
            });
        }

        const entry = await this.prisma.meal.update({
            where: { id, userId },
            data: {
                ...(data.mealType && { mealType: data.mealType }),
                ...(data.totalCalories !== undefined && { totalCalories: data.totalCalories }),
                ...(data.totalProtein !== undefined && { totalProtein: data.totalProtein }),
                ...(data.totalCarbs !== undefined && { totalCarbs: data.totalCarbs }),
                ...(data.totalFat !== undefined && { totalFat: data.totalFat }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.foods && data.foods.length > 0 && {
                    foods: {
                        create: data.foods.map(food => ({
                            foodId: food.foodId,
                            foodName: food.foodName,
                            brandName: food.brandName,
                            servingSize: food.servingSize,
                            servingUnit: food.servingUnit,
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                        })),
                    },
                }),
            },
            include: { foods: true },
        });

        return this.mapToEntity(entry);
    }

    async deleteMeal(id: string, userId: string): Promise<void> {
        await this.prisma.meal.delete({
            where: { id, userId },
        });
    }

    async setNutritionGoals(userId: string, goals: NutritionGoalsData): Promise<NutritionGoals> {
        const entry = await this.prisma.nutritionGoals.upsert({
            where: { userId },
            update: {
                dailyCalories: goals.dailyCalories,
                dailyProtein: goals.dailyProtein,
                dailyCarbs: goals.dailyCarbs,
                dailyFat: goals.dailyFat,
            },
            create: {
                userId,
                dailyCalories: goals.dailyCalories,
                dailyProtein: goals.dailyProtein,
                dailyCarbs: goals.dailyCarbs,
                dailyFat: goals.dailyFat,
            },
        });

        return this.mapGoalsToEntity(entry);
    }

    async getNutritionGoals(userId: string): Promise<NutritionGoals | null> {
        const entry = await this.prisma.nutritionGoals.findUnique({
            where: { userId },
        });

        return entry ? this.mapGoalsToEntity(entry) : null;
    }

    private mapToEntity(prismaEntry: any): Meal {
        return {
            id: prismaEntry.id,
            userId: prismaEntry.userId,
            mealType: prismaEntry.mealType,
            date: prismaEntry.date,
            totalCalories: prismaEntry.totalCalories,
            totalProtein: prismaEntry.totalProtein,
            totalCarbs: prismaEntry.totalCarbs,
            totalFat: prismaEntry.totalFat,
            notes: prismaEntry.notes,
            foods: (prismaEntry.foods || []).map((f: any) => ({
                id: f.id,
                mealId: f.mealId,
                foodId: f.foodId,
                foodName: f.foodName,
                brandName: f.brandName,
                servingSize: f.servingSize,
                servingUnit: f.servingUnit,
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fat: f.fat,
                createdAt: f.createdAt,
            })),
            createdAt: prismaEntry.createdAt,
            updatedAt: prismaEntry.updatedAt,
        };
    }

    private mapGoalsToEntity(prismaEntry: any): NutritionGoals {
        return {
            id: prismaEntry.id,
            userId: prismaEntry.userId,
            dailyCalories: prismaEntry.dailyCalories,
            dailyProtein: prismaEntry.dailyProtein,
            dailyCarbs: prismaEntry.dailyCarbs,
            dailyFat: prismaEntry.dailyFat,
            createdAt: prismaEntry.createdAt,
            updatedAt: prismaEntry.updatedAt,
        };
    }
}
