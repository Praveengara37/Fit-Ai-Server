export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealFoodData = {
    foodId?: string;
    foodName: string;
    brandName?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type LogMealData = {
    userId: string;
    mealType: MealType;
    date: string;
    foods: MealFoodData[];
    notes?: string;
};

export type UpdateMealData = {
    mealType?: MealType;
    foods?: MealFoodData[];
    notes?: string;
};

export type NutritionGoalsData = {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
};

export type NutritionTotals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type MealStatsResult = {
    totalCalories: number;
    averageCalories: number;
    totalProtein: number;
    averageProtein: number;
    totalCarbs: number;
    averageCarbs: number;
    totalFat: number;
    averageFat: number;
    daysLogged: number;
    totalMeals: number;
    averageMealsPerDay: number;
    highestCalorieDay: {
        date: string;
        calories: number;
    } | null;
    lowestCalorieDay: {
        date: string;
        calories: number;
    } | null;
};

export type FoodSearchResult = {
    foodId: string;
    name: string;
    brandName: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
};

export type FoodServingDetail = {
    servingId: string;
    servingDescription: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type FoodDetailResult = {
    foodId: string;
    name: string;
    brandName: string | null;
    servings: FoodServingDetail[];
};
