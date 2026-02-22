# FitAI Meal Tracking Feature - Backend Development PRD

## ROLE
You are a senior backend engineer with 10+ years of experience building nutrition and meal tracking applications. You have deep expertise in Express.js, TypeScript, MySQL, Prisma ORM, OAuth 2.0 authentication, third-party API integration (FatSecret), Clean Architecture, and RESTful API design. You've built production systems handling millions of daily meal logs with expertise in data modeling, caching strategies, and performance optimization.

## PROBLEM STATEMENT

### Current State
FitAI currently has:
- Authentication system (JWT-based)
- User profile management
- Step tracking (automatic via mobile)
- Web and mobile frontends

### The Gap
Users cannot track their nutrition. There's no way to:
- Search for foods and get nutrition information
- Log meals throughout the day (breakfast, lunch, dinner, snacks)
- Track calories and macronutrients (protein, carbs, fat)
- View daily and weekly nutrition totals
- Analyze eating patterns and trends
- Balance calorie intake vs activity (steps)

### User Need
Users need a complete meal tracking system that:
1. Searches 900,000+ foods via FatSecret API (includes branded items, restaurants)
2. Returns accurate nutrition data (calories, protein, carbs, fat)
3. Allows logging meals by type (breakfast, lunch, dinner, snacks)
4. Stores meal history with all nutrition details
5. Calculates daily totals (calories, macros)
6. Provides weekly statistics and trends
7. Handles API authentication (OAuth 2.0)
8. Implements caching to reduce API calls
9. Optimizes for performance and cost

### Business Value
- Completes fitness tracking (activity + nutrition)
- Increases user engagement (3-5 daily interactions)
- Enables calorie balance insights (in vs out)
- Foundation for AI meal recommendations
- Competitive feature parity with MyFitnessPal

## TECHNICAL CONTEXT

### Existing Setup
**Backend Stack:**
- Framework: Express.js with TypeScript
- Database: MySQL 8.0 via Prisma
- Architecture: Clean Architecture (entities → use cases → controllers → routes)
- Auth: JWT (cookies + Bearer tokens)
- Validation: Zod schemas

**Project Structure:**
```
fitai-backend/
├── src/
│   ├── config/           # Database, env, logger
│   ├── domain/           # Entities, interfaces
│   ├── infrastructure/   # Repositories (Prisma)
│   ├── application/      # Use cases (business logic)
│   ├── presentation/     # Controllers, routes, middleware, validators
│   ├── shared/           # Utils, errors, types
│   ├── app.ts           # Express setup
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── .env                 # Environment variables
```

**Existing APIs:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/profile/me
PATCH  /api/profile/update
POST   /api/steps/log
GET    /api/steps/today
GET    /api/steps/history
GET    /api/steps/stats
```

### FatSecret API Integration

**API Credentials (Already Obtained):**
```
Client ID: e1f3ac1cb4aa4ece8c6e567f97abe69b
Client Secret: 8d92790cea4b43938b2921b411813f1d
```

**Authentication: OAuth 2.0**

**Step 1: Get Access Token**
```
POST https://oauth.fatsecret.com/connect/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

Body:
grant_type=client_credentials&scope=basic

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

**Step 2: Make API Requests**
```
POST https://platform.fatsecret.com/rest/server.api
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "method": "foods.search",
  "search_expression": "chicken breast",
  "format": "json",
  "max_results": 10
}

Response:
{
  "foods": {
    "food": [
      {
        "food_id": "12345",
        "food_name": "Chicken Breast",
        "food_description": "Per 100g - Calories: 165kcal | Fat: 3.6g | Carbs: 0g | Protein: 31g",
        "brand_name": "",
        "food_type": "Generic"
      }
    ]
  }
}
```

**Available Methods:**
- `foods.search` - Search foods by name
- `food.get` - Get detailed food info by ID
- `foods.search.v2` - Advanced search with filters

**Rate Limits:**
- Free tier: 5,000 calls per day
- Recommended: Cache results, implement token refresh

## REQUIREMENTS

### FR1: Food Search API

**Endpoint:** GET /api/foods/search

**Purpose:** Search FatSecret API for foods, return nutrition data

**Authentication:** Required (JWT)

**Query Parameters:**
```
query (required): string (search term, e.g., "chicken breast")
maxResults (optional): number (default: 10, max: 50)
```

**Business Logic:**
1. Validate query (min 2 characters)
2. Check cache first (if food searched recently, return cached)
3. Get FatSecret access token (refresh if expired)
4. Call FatSecret foods.search API
5. Parse and normalize response
6. Cache results (30 days TTL)
7. Return formatted nutrition data

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "foodId": "12345",
        "name": "Chicken Breast",
        "brandName": null,
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "servingSize": "100g",
        "servingUnit": "g"
      }
    ],
    "total": 15
  }
}
```

**Error Responses:**
- 400: Invalid query (too short)
- 401: Unauthorized
- 429: Rate limit exceeded
- 503: FatSecret API unavailable

---

### FR2: Get Food Details

**Endpoint:** GET /api/foods/:foodId

**Purpose:** Get detailed nutrition info for specific food

**Authentication:** Required

**Path Parameter:**
```
foodId: string (FatSecret food ID)
```

**Business Logic:**
1. Check cache first
2. Call FatSecret food.get API
3. Parse all serving sizes and nutrition per serving
4. Cache result (30 days)
5. Return detailed data

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "food": {
      "foodId": "12345",
      "name": "Chicken Breast",
      "brandName": null,
      "servings": [
        {
          "servingId": "1",
          "servingDescription": "100g",
          "calories": 165,
          "protein": 31,
          "carbs": 0,
          "fat": 3.6
        },
        {
          "servingId": "2",
          "servingDescription": "1 breast (172g)",
          "calories": 284,
          "protein": 53.4,
          "carbs": 0,
          "fat": 6.2
        }
      ]
    }
  }
}
```

---

### FR3: Log Meal

**Endpoint:** POST /api/meals/log

**Purpose:** Log a meal with foods

**Authentication:** Required

**Request Body:**
```json
{
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "date": "2026-02-22",
  "foods": [
    {
      "foodId": "12345",
      "foodName": "Chicken Breast",
      "servingSize": 200,
      "servingUnit": "g",
      "calories": 330,
      "protein": 62,
      "carbs": 0,
      "fat": 7.2
    }
  ],
  "notes": "Grilled with vegetables" // optional
}
```

**Business Logic:**
1. Validate meal type (enum)
2. Validate date (not future, max 7 days past)
3. Validate foods array (min 1 food)
4. Calculate total nutrition for meal
5. Create meal record
6. Create meal_foods records (one per food)
7. Update user's daily nutrition totals
8. Return created meal with totals

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "meal": {
      "id": "uuid",
      "userId": "uuid",
      "mealType": "lunch",
      "date": "2026-02-22",
      "totalCalories": 330,
      "totalProtein": 62,
      "totalCarbs": 0,
      "totalFat": 7.2,
      "notes": "Grilled with vegetables",
      "foods": [
        {
          "id": "uuid",
          "foodName": "Chicken Breast",
          "servingSize": 200,
          "servingUnit": "g",
          "calories": 330,
          "protein": 62,
          "carbs": 0,
          "fat": 7.2
        }
      ],
      "createdAt": "2026-02-22T12:30:00Z"
    }
  }
}
```

---

### FR4: Get Today's Meals

**Endpoint:** GET /api/meals/today

**Purpose:** Get all meals logged today with totals

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-22",
    "meals": [
      {
        "id": "uuid",
        "mealType": "breakfast",
        "totalCalories": 450,
        "totalProtein": 15,
        "totalCarbs": 65,
        "totalFat": 12,
        "foods": [ /* array of foods */ ],
        "createdAt": "2026-02-22T08:00:00Z"
      },
      {
        "id": "uuid",
        "mealType": "lunch",
        "totalCalories": 550,
        "totalProtein": 45,
        "totalCarbs": 50,
        "totalFat": 18,
        "foods": [ /* array of foods */ ],
        "createdAt": "2026-02-22T13:00:00Z"
      }
    ],
    "totals": {
      "calories": 1000,
      "protein": 60,
      "carbs": 115,
      "fat": 30
    },
    "goals": {
      "calories": 2000,
      "protein": 150,
      "carbs": 250,
      "fat": 65
    },
    "remaining": {
      "calories": 1000,
      "protein": 90,
      "carbs": 135,
      "fat": 35
    }
  }
}
```

---

### FR5: Get Meal History

**Endpoint:** GET /api/meals/history

**Purpose:** Get meals for date range

**Authentication:** Required

**Query Parameters:**
```
startDate (optional): YYYY-MM-DD (default: 7 days ago)
endDate (optional): YYYY-MM-DD (default: today)
limit (optional): number (max 90 days)
```

**Business Logic:**
1. Validate date range (max 90 days)
2. Get all meals in range
3. Group by date
4. Calculate daily totals
5. Calculate period statistics

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2026-02-22",
        "meals": [ /* array */ ],
        "totals": {
          "calories": 1800,
          "protein": 140,
          "carbs": 200,
          "fat": 60
        }
      },
      {
        "date": "2026-02-21",
        "meals": [ /* array */ ],
        "totals": {
          "calories": 2100,
          "protein": 160,
          "carbs": 220,
          "fat": 70
        }
      }
    ],
    "periodStats": {
      "totalDays": 7,
      "averageCalories": 1950,
      "averageProtein": 145,
      "averageCarbs": 210,
      "averageFat": 65,
      "totalCalories": 13650
    }
  }
}
```

---

### FR6: Get Nutrition Statistics

**Endpoint:** GET /api/meals/stats

**Purpose:** Get nutrition statistics for period

**Authentication:** Required

**Query Parameters:**
```
period: 'week' | 'month' | 'year' (default: 'week')
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "stats": {
      "totalCalories": 13650,
      "averageCalories": 1950,
      "totalProtein": 1015,
      "averageProtein": 145,
      "totalCarbs": 1470,
      "averageCarbs": 210,
      "totalFat": 455,
      "averageFat": 65,
      "daysLogged": 7,
      "totalMeals": 28,
      "averageMealsPerDay": 4,
      "goalReachedDays": 5,
      "highestCalorieDay": {
        "date": "2026-02-20",
        "calories": 2300
      },
      "lowestCalorieDay": {
        "date": "2026-02-18",
        "calories": 1600
      }
    }
  }
}
```

---

### FR7: Update Meal

**Endpoint:** PATCH /api/meals/:mealId

**Purpose:** Update existing meal

**Authentication:** Required

**Request Body:** Same as log meal (partial updates allowed)

**Business Logic:**
1. Verify user owns meal
2. Update meal and foods
3. Recalculate totals
4. Update daily totals

---

### FR8: Delete Meal

**Endpoint:** DELETE /api/meals/:mealId

**Purpose:** Delete meal

**Authentication:** Required

**Business Logic:**
1. Verify user owns meal
2. Delete meal and associated foods (cascade)
3. Update daily totals

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Meal deleted successfully"
  }
}
```

---

### FR9: Set Nutrition Goals

**Endpoint:** POST /api/nutrition/goals

**Purpose:** Set custom daily nutrition goals

**Authentication:** Required

**Request Body:**
```json
{
  "dailyCalories": 2000,
  "dailyProtein": 150,
  "dailyCarbs": 250,
  "dailyFat": 65
}
```

**Business Logic:**
1. Validate values (calories: 1000-5000, macros reasonable)
2. Calculate if macros add up to calories (tolerance ±10%)
3. Save or update nutrition goals
4. Return goals

---

## DATABASE DESIGN

### New Tables

#### 1. `meals` Table
```prisma
model Meal {
  id              String      @id @default(uuid())
  userId          String      @map("user_id")
  mealType        MealType    @map("meal_type")
  date            DateTime    @db.Date
  totalCalories   Float       @map("total_calories")
  totalProtein    Float       @map("total_protein")
  totalCarbs      Float       @map("total_carbs")
  totalFat        Float       @map("total_fat")
  notes           String?     @db.Text
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  foods           MealFood[]
  
  @@unique([userId, date, mealType])
  @@index([userId, date])
  @@map("meals")
}

enum MealType {
  breakfast
  lunch
  dinner
  snack
}
```

#### 2. `meal_foods` Table
```prisma
model MealFood {
  id              String   @id @default(uuid())
  mealId          String   @map("meal_id")
  foodId          String?  @map("food_id") // FatSecret food ID
  foodName        String   @map("food_name")
  brandName       String?  @map("brand_name")
  servingSize     Float    @map("serving_size")
  servingUnit     String   @map("serving_unit")
  calories        Float
  protein         Float
  carbs           Float
  fat             Float
  createdAt       DateTime @default(now()) @map("created_at")
  
  meal            Meal     @relation(fields: [mealId], references: [id], onDelete: Cascade)
  
  @@index([mealId])
  @@map("meal_foods")
}
```

#### 3. `nutrition_goals` Table
```prisma
model NutritionGoals {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  dailyCalories   Int      @map("daily_calories") @default(2000)
  dailyProtein    Float    @map("daily_protein") @default(150)
  dailyCarbs      Float    @map("daily_carbs") @default(250)
  dailyFat        Float    @map("daily_fat") @default(65)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("nutrition_goals")
}
```

#### 4. `food_cache` Table (For API optimization)
```prisma
model FoodCache {
  id              String   @id @default(uuid())
  foodId          String   @unique @map("food_id") // FatSecret food ID
  foodName        String   @map("food_name")
  brandName       String?  @map("brand_name")
  foodData        Json     @map("food_data") // Full FatSecret response
  searchTerms     String   @map("search_terms") @db.Text // For search optimization
  cachedAt        DateTime @default(now()) @map("cached_at")
  expiresAt       DateTime @map("expires_at")
  
  @@index([foodName])
  @@index([searchTerms])
  @@map("food_cache")
}
```

#### 5. Update `User` Model
```prisma
model User {
  // ... existing fields
  meals           Meal[]
  nutritionGoals  NutritionGoals?
}
```

### Migration
```bash
npx prisma migrate dev --name add_meal_tracking
```

## DELIVERABLES

### 1. Configuration

**File:** `src/config/fatsecret.ts`
```typescript
export const fatsecretConfig = {
  clientId: process.env.FATSECRET_CLIENT_ID!,
  clientSecret: process.env.FATSECRET_CLIENT_SECRET!,
  tokenUrl: 'https://oauth.fatsecret.com/connect/token',
  apiUrl: 'https://platform.fatsecret.com/rest/server.api',
  cacheEnabled: true,
  cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const nutritionDefaults = {
  dailyCalories: 2000,
  dailyProtein: 150,
  dailyCarbs: 250,
  dailyFat: 65,
};
```

**Update `.env`:**
```env
FATSECRET_CLIENT_ID=e1f3ac1cb4aa4ece8c6e567f97abe69b
FATSECRET_CLIENT_SECRET=8d92790cea4b43938b2921b411813f1d
```

---

### 2. FatSecret Service (API Integration)

**File:** `src/infrastructure/services/FatSecretService.ts`
```typescript
import axios from 'axios';
import { fatsecretConfig } from '@/config/fatsecret';

interface FatSecretToken {
  access_token: string;
  expires_at: number;
}

export class FatSecretService {
  private token: FatSecretToken | null = null;

  async getAccessToken(): Promise<string> {
    // Check if token exists and is valid
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    // Get new token
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
      access_token: response.data.access_token,
      expires_at: Date.now() + (response.data.expires_in * 1000) - 60000, // 1 min buffer
    };

    return this.token.access_token;
  }

  async searchFoods(query: string, maxResults: number = 10): Promise<any> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      fatsecretConfig.apiUrl,
      {
        method: 'foods.search',
        search_expression: query,
        format: 'json',
        max_results: maxResults,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async getFoodById(foodId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      fatsecretConfig.apiUrl,
      {
        method: 'food.get.v2',
        food_id: foodId,
        format: 'json',
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  parseNutritionDescription(description: string): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } {
    // Parse "Per 100g - Calories: 165kcal | Fat: 3.6g | Carbs: 0g | Protein: 31g"
    const caloriesMatch = description.match(/Calories:\s*([\d.]+)/i);
    const fatMatch = description.match(/Fat:\s*([\d.]+)/i);
    const carbsMatch = description.match(/Carbs:\s*([\d.]+)/i);
    const proteinMatch = description.match(/Protein:\s*([\d.]+)/i);

    return {
      calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
      fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
      carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
      protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
    };
  }
}
```

---

### 3. Domain Layer

**File:** `src/domain/entities/Meal.ts`
```typescript
export interface Meal {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  foods: MealFood[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealFood {
  id: string;
  mealId: string;
  foodId?: string;
  foodName: string;
  brandName?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionGoals {
  id: string;
  userId: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}
```

**File:** `src/domain/interfaces/IMealRepository.ts`
```typescript
export interface IMealRepository {
  createMeal(data: CreateMealData): Promise<Meal>;
  getMealById(id: string, userId: string): Promise<Meal | null>;
  getTodayMeals(userId: string, date: Date): Promise<Meal[]>;
  getMealHistory(userId: string, startDate: Date, endDate: Date): Promise<Meal[]>;
  updateMeal(id: string, userId: string, data: UpdateMealData): Promise<Meal>;
  deleteMeal(id: string, userId: string): Promise<void>;
  
  // Goals
  setNutritionGoals(userId: string, goals: NutritionGoalsData): Promise<NutritionGoals>;
  getNutritionGoals(userId: string): Promise<NutritionGoals | null>;
}
```

---

### 4. Infrastructure Layer

**File:** `src/infrastructure/repositories/MealRepository.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { IMealRepository } from '@/domain/interfaces/IMealRepository';

export class MealRepository implements IMealRepository {
  constructor(private prisma: PrismaClient) {}

  async createMeal(data: CreateMealData): Promise<Meal> {
    return await this.prisma.meal.create({
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
          create: data.foods,
        },
      },
      include: {
        foods: true,
      },
    });
  }

  async getTodayMeals(userId: string, date: Date): Promise<Meal[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        foods: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getMealHistory(userId: string, startDate: Date, endDate: Date): Promise<Meal[]> {
    return await this.prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        foods: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  // ... implement other methods
}
```

---

### 5. Application Layer (Use Cases)

**File:** `src/application/use-cases/SearchFoods.ts`
```typescript
import { FatSecretService } from '@/infrastructure/services/FatSecretService';
import { FoodCacheRepository } from '@/infrastructure/repositories/FoodCacheRepository';

export class SearchFoods {
  constructor(
    private fatSecretService: FatSecretService,
    private foodCacheRepository: FoodCacheRepository
  ) {}

  async execute(query: string, maxResults: number = 10) {
    // 1. Validate query
    if (query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    // 2. Check cache
    const cachedFoods = await this.foodCacheRepository.searchByTerm(query);
    if (cachedFoods.length > 0) {
      return cachedFoods.slice(0, maxResults);
    }

    // 3. Call FatSecret API
    const response = await this.fatSecretService.searchFoods(query, maxResults);

    // 4. Parse and normalize
    const foods = this.parseSearchResults(response);

    // 5. Cache results
    await this.foodCacheRepository.cacheSearchResults(query, foods);

    return foods;
  }

  private parseSearchResults(response: any) {
    const foodArray = response.foods?.food || [];
    
    return foodArray.map((food: any) => {
      const nutrition = this.fatSecretService.parseNutritionDescription(
        food.food_description
      );

      return {
        foodId: food.food_id,
        name: food.food_name,
        brandName: food.brand_name || null,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        servingSize: this.extractServingSize(food.food_description),
        servingUnit: this.extractServingUnit(food.food_description),
      };
    });
  }

  private extractServingSize(description: string): number {
    const match = description.match(/Per\s+([\d.]+)/i);
    return match ? parseFloat(match[1]) : 100;
  }

  private extractServingUnit(description: string): string {
    const match = description.match(/Per\s+[\d.]+\s*(\w+)/i);
    return match ? match[1] : 'g';
  }
}
```

**File:** `src/application/use-cases/LogMeal.ts`
```typescript
export class LogMeal {
  constructor(
    private mealRepository: IMealRepository
  ) {}

  async execute(data: LogMealData) {
    // 1. Validate
    this.validateMealData(data);

    // 2. Calculate totals
    const totals = this.calculateTotals(data.foods);

    // 3. Create meal
    const meal = await this.mealRepository.createMeal({
      userId: data.userId,
      mealType: data.mealType,
      date: data.date,
      ...totals,
      notes: data.notes,
      foods: data.foods,
    });

    return meal;
  }

  private validateMealData(data: LogMealData) {
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(data.mealType)) {
      throw new Error('Invalid meal type');
    }

    if (data.foods.length === 0) {
      throw new Error('Meal must contain at least one food');
    }

    const mealDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (mealDate > today) {
      throw new Error('Cannot log meals in the future');
    }
  }

  private calculateTotals(foods: MealFoodData[]) {
    return foods.reduce(
      (totals, food) => ({
        totalCalories: totals.totalCalories + food.calories,
        totalProtein: totals.totalProtein + food.protein,
        totalCarbs: totals.totalCarbs + food.carbs,
        totalFat: totals.totalFat + food.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
  }
}
```

(Continue with other use cases: GetTodayMeals, GetMealHistory, GetMealStats, etc.)

---

### 6. Presentation Layer

**File:** `src/presentation/validators/mealValidators.ts`
```typescript
import { z } from 'zod';

export const searchFoodsSchema = z.object({
  query: z.string().min(2).max(100),
  maxResults: z.number().int().min(1).max(50).optional(),
});

export const logMealSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  foods: z.array(
    z.object({
      foodId: z.string().optional(),
      foodName: z.string(),
      brandName: z.string().optional(),
      servingSize: z.number().positive(),
      servingUnit: z.string(),
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
    })
  ).min(1),
  notes: z.string().max(500).optional(),
});

export const nutritionGoalsSchema = z.object({
  dailyCalories: z.number().int().min(1000).max(5000),
  dailyProtein: z.number().min(0).max(500),
  dailyCarbs: z.number().min(0).max(1000),
  dailyFat: z.number().min(0).max(300),
});
```

**File:** `src/presentation/controllers/FoodController.ts`
```typescript
export class FoodController {
  constructor(
    private searchFoods: SearchFoods,
    private getFoodById: GetFoodById
  ) {}

  async searchFoods(req: Request, res: Response): Promise<void> {
    try {
      const { query, maxResults } = searchFoodsSchema.parse(req.query);
      
      const foods = await this.searchFoods.execute(query, maxResults);
      
      successResponse(res, 200, { foods, total: foods.length });
    } catch (error) {
      handleError(res, error);
    }
  }

  async getFoodDetails(req: Request, res: Response): Promise<void> {
    try {
      const { foodId } = req.params;
      
      const food = await this.getFoodById.execute(foodId);
      
      if (!food) {
        return errorResponse(res, 404, 'Food not found');
      }
      
      successResponse(res, 200, { food });
    } catch (error) {
      handleError(res, error);
    }
  }
}
```

**File:** `src/presentation/controllers/MealController.ts`
```typescript
export class MealController {
  async logMeal(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = logMealSchema.parse(req.body);
      
      const meal = await this.logMeal.execute({ ...data, userId });
      
      successResponse(res, 201, { meal });
    } catch (error) {
      handleError(res, error);
    }
  }

  async getTodayMeals(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const result = await this.getTodayMeals.execute(userId);
      
      successResponse(res, 200, result);
    } catch (error) {
      handleError(res, error);
    }
  }

  // ... other methods
}
```

---

### 7. Routes

**File:** `src/presentation/routes/foodRoutes.ts`
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { FoodController } from '../controllers/FoodController';

const router = Router();
const controller = new FoodController();

router.get('/search', authMiddleware, controller.searchFoods);
router.get('/:foodId', authMiddleware, controller.getFoodDetails);

export default router;
```

**File:** `src/presentation/routes/mealRoutes.ts`
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { MealController } from '../controllers/MealController';

const router = Router();
const controller = new MealController();

router.post('/log', authMiddleware, controller.logMeal);
router.get('/today', authMiddleware, controller.getTodayMeals);
router.get('/history', authMiddleware, controller.getHistory);
router.get('/stats', authMiddleware, controller.getStats);
router.patch('/:mealId', authMiddleware, controller.updateMeal);
router.delete('/:mealId', authMiddleware, controller.deleteMeal);

export default router;
```

**File:** `src/presentation/routes/nutritionRoutes.ts`
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { NutritionController } from '../controllers/NutritionController';

const router = Router();
const controller = new NutritionController();

router.post('/goals', authMiddleware, controller.setGoals);
router.get('/goals', authMiddleware, controller.getGoals);

export default router;
```

**Update `src/app.ts`:**
```typescript
import foodRoutes from './presentation/routes/foodRoutes';
import mealRoutes from './presentation/routes/mealRoutes';
import nutritionRoutes from './presentation/routes/nutritionRoutes';

app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/nutrition', nutritionRoutes);
```

---

## TESTING CHECKLIST

### API Integration Tests
- [ ] FatSecret token generation works
- [ ] Token refresh when expired
- [ ] Food search returns results
- [ ] Food detail retrieval works
- [ ] Handle API errors gracefully

### Meal Logging Tests
- [ ] Can log meal with single food
- [ ] Can log meal with multiple foods
- [ ] Totals calculate correctly
- [ ] Cannot log future meals
- [ ] Cannot log meals >7 days old

### Data Retrieval Tests
- [ ] Get today's meals returns all meals
- [ ] Totals are accurate
- [ ] History retrieves correct date range
- [ ] Stats calculate properly
- [ ] Empty states handle gracefully

### Goal Management Tests
- [ ] Can set nutrition goals
- [ ] Goals validate properly
- [ ] Goals persist correctly
- [ ] Default goals apply for new users

### Cache Tests
- [ ] Food search results cached
- [ ] Cache expires after TTL
- [ ] Cache reduces API calls

## SUCCESS CRITERIA

✅ FatSecret OAuth integration working  
✅ Food search returns accurate nutrition data  
✅ Meal logging saves correctly to database  
✅ Daily totals calculate accurately  
✅ Weekly statistics compute properly  
✅ Caching reduces API calls by 70%+  
✅ All endpoints return consistent response format  
✅ Error handling comprehensive  
✅ Database migrations run successfully  
✅ Clean Architecture maintained  
✅ TypeScript strict mode with no errors  

## TIMELINE ESTIMATE

**Total: 2-3 hours**

- Prisma schema + migration: 20 min
- FatSecret service integration: 30 min
- Repositories: 20 min
- Use cases: 30 min
- Controllers + routes: 20 min
- Validators: 10 min
- Testing: 20 min
- Documentation: 10 min

Create all files with production-quality code following Clean Architecture principles.