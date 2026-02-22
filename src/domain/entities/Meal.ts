export interface Meal {
    id: string;
    userId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: Date;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    notes?: string | null;
    foods: MealFood[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MealFood {
    id: string;
    mealId: string;
    foodId?: string | null;
    foodName: string;
    brandName?: string | null;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    createdAt: Date;
}

export interface NutritionGoals {
    id: string;
    userId: string;
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
    createdAt: Date;
    updatedAt: Date;
}
