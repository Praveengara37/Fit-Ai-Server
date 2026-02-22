import { Meal, NutritionGoals } from '../entities/Meal';
import { NutritionGoalsData, MealFoodData } from '../../shared/types/meal.types';

export interface CreateMealInput {
    userId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: Date;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    notes?: string;
    foods: MealFoodData[];
}

export interface UpdateMealInput {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFat?: number;
    notes?: string;
    foods?: MealFoodData[];
}

export interface IMealRepository {
    createMeal(data: CreateMealInput): Promise<Meal>;
    getMealById(id: string, userId: string): Promise<Meal | null>;
    getTodayMeals(userId: string, date: Date): Promise<Meal[]>;
    getMealHistory(userId: string, startDate: Date, endDate: Date): Promise<Meal[]>;
    updateMeal(id: string, userId: string, data: UpdateMealInput): Promise<Meal>;
    deleteMeal(id: string, userId: string): Promise<void>;

    // Nutrition Goals
    setNutritionGoals(userId: string, goals: NutritionGoalsData): Promise<NutritionGoals>;
    getNutritionGoals(userId: string): Promise<NutritionGoals | null>;
}
