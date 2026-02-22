/**
 * FatSecret API configuration
 */
export const fatsecretConfig = {
    clientId: process.env.FATSECRET_CLIENT_ID || '',
    clientSecret: process.env.FATSECRET_CLIENT_SECRET || '',
    tokenUrl: 'https://oauth.fatsecret.com/connect/token',
    apiUrl: 'https://platform.fatsecret.com/rest/server.api',
    cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
};

/**
 * Default daily nutrition goals for new users
 */
export const nutritionDefaults = {
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 65,
};
