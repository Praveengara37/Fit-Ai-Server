import { FoodSearchResult, FoodDetailResult } from '../../shared/types/meal.types';

export interface IFoodCacheRepository {
    searchByTerm(query: string): Promise<FoodSearchResult[]>;
    getByFoodId(foodId: string): Promise<FoodDetailResult | null>;
    cacheSearchResults(query: string, foods: FoodSearchResult[]): Promise<void>;
    cacheFoodDetail(foodId: string, foodName: string, brandName: string | null, data: FoodDetailResult): Promise<void>;
}
