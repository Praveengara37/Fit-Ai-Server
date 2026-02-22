import axios from 'axios';
import { fatsecretConfig } from '../../config/fatsecret';
import { FatSecretApiError } from '../../shared/errors/MealErrors';

interface FatSecretToken {
    accessToken: string;
    expiresAt: number;
}

/**
 * FatSecret API service for food search and nutrition data
 * Handles OAuth 2.0 client_credentials flow with auto-refresh
 */
export class FatSecretService {
    private token: FatSecretToken | null = null;

    /**
     * Get or refresh FatSecret access token
     */
    async getAccessToken(): Promise<string> {
        // Return cached token if still valid
        if (this.token && this.token.expiresAt > Date.now()) {
            return this.token.accessToken;
        }

        const auth = Buffer.from(
            `${fatsecretConfig.clientId}:${fatsecretConfig.clientSecret}`
        ).toString('base64');

        const response = await axios.post(
            fatsecretConfig.tokenUrl,
            'grant_type=client_credentials&scope=basic',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        this.token = {
            accessToken: response.data.access_token,
            expiresAt: Date.now() + (response.data.expires_in * 1000) - 60000, // 1 min buffer
        };

        return this.token.accessToken;
    }

    /**
     * Search foods by query string
     */
    async searchFoods(query: string, maxResults: number = 10): Promise<any> {
        const token = await this.getAccessToken();

        const response = await axios.post(
            fatsecretConfig.apiUrl,
            new URLSearchParams({
                method: 'foods.search',
                search_expression: query,
                format: 'json',
                max_results: maxResults.toString(),
            }),
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // FatSecret returns errors as 200 OK with an error body
        if (response.data?.error) {
            const err = response.data.error;
            console.error('FatSecret API error:', err);
            throw new FatSecretApiError(`FatSecret API error (code ${err.code}): ${err.message}`);
        }

        return response.data;
    }

    /**
     * Get detailed food info by FatSecret food ID
     */
    async getFoodById(foodId: string): Promise<any> {
        const token = await this.getAccessToken();

        const response = await axios.post(
            fatsecretConfig.apiUrl,
            new URLSearchParams({
                method: 'food.get.v4',
                food_id: foodId,
                format: 'json',
            }),
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // FatSecret returns errors as 200 OK with an error body
        if (response.data?.error) {
            const err = response.data.error;
            console.error('FatSecret API error:', err);
            throw new FatSecretApiError(`FatSecret API error (code ${err.code}): ${err.message}`);
        }

        return response.data;
    }

    /**
     * Parse FatSecret's description string into numeric nutrition values
     * Example: "Per 100g - Calories: 165kcal | Fat: 3.6g | Carbs: 0g | Protein: 31g"
     */
    parseNutritionDescription(description: string): {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        servingSize: number;
        servingUnit: string;
    } {
        const caloriesMatch = description.match(/Calories:\s*([\d.]+)/i);
        const fatMatch = description.match(/Fat:\s*([\d.]+)/i);
        const carbsMatch = description.match(/Carbs:\s*([\d.]+)/i);
        const proteinMatch = description.match(/Protein:\s*([\d.]+)/i);
        const servingMatch = description.match(/Per\s+([\d.]+)\s*(\w+)/i);

        return {
            calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
            fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
            carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
            protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
            servingSize: servingMatch ? parseFloat(servingMatch[1]) : 100,
            servingUnit: servingMatch ? servingMatch[2] : 'g',
        };
    }
}
