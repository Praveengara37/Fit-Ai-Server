import { FatSecretService } from '../../infrastructure/services/FatSecretService';
import { IFoodCacheRepository } from '../../domain/interfaces/IFoodCacheRepository';
import { FoodDetailResult, FoodServingDetail } from '../../shared/types/meal.types';
import { FoodNotFoundError, FatSecretApiError } from '../../shared/errors/MealErrors';

export class GetFoodDetails {
    constructor(
        private readonly fatSecretService: FatSecretService,
        private readonly foodCacheRepository: IFoodCacheRepository
    ) { }

    async execute(foodId: string): Promise<FoodDetailResult> {
        // 1. Check cache
        const cached = await this.foodCacheRepository.getByFoodId(foodId);
        if (cached) {
            return cached;
        }

        try {
            // 2. Call FatSecret API
            const response = await this.fatSecretService.getFoodById(foodId);

            if (!response?.food) {
                throw new FoodNotFoundError(`Food with ID ${foodId} not found`);
            }

            // 3. Parse servings
            const food = response.food;
            const servings = this.parseServings(food.servings?.serving);

            const result: FoodDetailResult = {
                foodId: food.food_id,
                name: food.food_name,
                brandName: food.brand_name || null,
                servings,
            };

            // 4. Cache result
            await this.foodCacheRepository.cacheFoodDetail(
                result.foodId,
                result.name,
                result.brandName,
                result
            );

            return result;
        } catch (error: any) {
            if (error instanceof FoodNotFoundError) throw error;
            throw new FatSecretApiError(`Failed to get food details: ${error.message}`);
        }
    }

    private parseServings(servingsData: any): FoodServingDetail[] {
        if (!servingsData) return [];

        const servings = Array.isArray(servingsData) ? servingsData : [servingsData];

        return servings.map((s: any) => ({
            servingId: s.serving_id || '',
            servingDescription: s.serving_description || s.metric_serving_unit || 'serving',
            calories: parseFloat(s.calories) || 0,
            protein: parseFloat(s.protein) || 0,
            carbs: parseFloat(s.carbohydrate) || 0,
            fat: parseFloat(s.fat) || 0,
        }));
    }
}
