import { FatSecretService } from '../../infrastructure/services/FatSecretService';
import { IFoodCacheRepository } from '../../domain/interfaces/IFoodCacheRepository';
import { FoodSearchResult } from '../../shared/types/meal.types';
import { FoodSearchError } from '../../shared/errors/MealErrors';

export class SearchFoods {
    constructor(
        private readonly fatSecretService: FatSecretService,
        private readonly foodCacheRepository: IFoodCacheRepository
    ) { }

    async execute(query: string, maxResults: number = 10): Promise<{ foods: FoodSearchResult[]; total: number }> {
        // 1. Check cache first
        const cachedFoods = await this.foodCacheRepository.searchByTerm(query);
        if (cachedFoods.length > 0) {
            const sliced = cachedFoods.slice(0, maxResults);
            return { foods: sliced, total: sliced.length };
        }

        try {
            // 2. Call FatSecret API
            const response = await this.fatSecretService.searchFoods(query, maxResults);

            // 3. Parse and normalize results
            const foods = this.parseSearchResults(response);

            // 4. Cache results
            if (foods.length > 0) {
                await this.foodCacheRepository.cacheSearchResults(query, foods);
            }

            return { foods, total: foods.length };
        } catch (error: any) {
            throw new FoodSearchError(`Failed to search foods: ${error.message}`);
        }
    }

    private parseSearchResults(response: any): FoodSearchResult[] {
        const foodArray = response?.foods?.food;

        if (!foodArray) return [];

        // FatSecret can return a single object instead of an array
        const foods = Array.isArray(foodArray) ? foodArray : [foodArray];

        return foods.map((food: any) => {
            const nutrition = this.fatSecretService.parseNutritionDescription(
                food.food_description || ''
            );

            return {
                foodId: food.food_id,
                name: food.food_name,
                brandName: food.brand_name || null,
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbs: nutrition.carbs,
                fat: nutrition.fat,
                servingSize: nutrition.servingSize,
                servingUnit: nutrition.servingUnit,
            };
        });
    }
}
