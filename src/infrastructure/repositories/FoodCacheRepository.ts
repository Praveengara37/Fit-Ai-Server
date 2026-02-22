import { PrismaClient } from '@prisma/client';
import { IFoodCacheRepository } from '../../domain/interfaces/IFoodCacheRepository';
import { FoodSearchResult, FoodDetailResult } from '../../shared/types/meal.types';
import { fatsecretConfig } from '../../config/fatsecret';

export class FoodCacheRepository implements IFoodCacheRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Search cached foods by query term
     */
    async searchByTerm(query: string): Promise<FoodSearchResult[]> {
        const normalizedQuery = query.toLowerCase().trim();

        const cached = await this.prisma.foodCache.findMany({
            where: {
                searchTerms: {
                    contains: normalizedQuery,
                },
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        if (cached.length === 0) return [];

        // Extract food data from cache entries
        const results: FoodSearchResult[] = [];
        for (const entry of cached) {
            const data = entry.foodData as any;
            if (data && data.foodId) {
                results.push({
                    foodId: data.foodId,
                    name: data.name || entry.foodName,
                    brandName: data.brandName || entry.brandName,
                    calories: data.calories || 0,
                    protein: data.protein || 0,
                    carbs: data.carbs || 0,
                    fat: data.fat || 0,
                    servingSize: data.servingSize || 100,
                    servingUnit: data.servingUnit || 'g',
                });
            }
        }

        return results;
    }

    /**
     * Get cached food detail by FatSecret food ID
     */
    async getByFoodId(foodId: string): Promise<FoodDetailResult | null> {
        const entry = await this.prisma.foodCache.findUnique({
            where: {
                foodId,
                expiresAt: { gt: new Date() },
            },
        });

        if (!entry) return null;

        const data = entry.foodData as any;
        if (data && data.servings) {
            return data as FoodDetailResult;
        }

        return null;
    }

    /**
     * Cache search results — one entry per food
     */
    async cacheSearchResults(query: string, foods: FoodSearchResult[]): Promise<void> {
        const normalizedQuery = query.toLowerCase().trim();
        const expiresAt = new Date(Date.now() + fatsecretConfig.cacheTTL);

        for (const food of foods) {
            try {
                await this.prisma.foodCache.upsert({
                    where: { foodId: food.foodId },
                    update: {
                        foodData: food as any,
                        searchTerms: normalizedQuery,
                        cachedAt: new Date(),
                        expiresAt,
                    },
                    create: {
                        foodId: food.foodId,
                        foodName: food.name,
                        brandName: food.brandName,
                        foodData: food as any,
                        searchTerms: normalizedQuery,
                        cachedAt: new Date(),
                        expiresAt,
                    },
                });
            } catch (_error) {
                // Skip duplicate cache errors silently
            }
        }
    }

    /**
     * Cache detailed food data (includes servings)
     */
    async cacheFoodDetail(
        foodId: string,
        foodName: string,
        brandName: string | null,
        data: FoodDetailResult
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + fatsecretConfig.cacheTTL);

        try {
            await this.prisma.foodCache.upsert({
                where: { foodId },
                update: {
                    foodData: data as any,
                    cachedAt: new Date(),
                    expiresAt,
                },
                create: {
                    foodId,
                    foodName,
                    brandName,
                    foodData: data as any,
                    searchTerms: foodName.toLowerCase(),
                    cachedAt: new Date(),
                    expiresAt,
                },
            });
        } catch (_error) {
            // Skip cache errors silently
        }
    }
}
