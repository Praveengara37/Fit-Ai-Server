# FitAI Step Tracking Feature - Backend Development PRD

## ROLE
You are a senior backend engineer with 10+ years of experience building scalable fitness and health tracking applications. You have deep expertise in Express.js, TypeScript, MySQL, Prisma ORM, RESTful API design, and Clean Architecture principles. You've built production systems handling millions of daily health data points with expertise in data modeling, validation, performance optimization, and API design best practices.

## PROBLEM STATEMENT

### Current State
FitAI currently has:
- Authentication system (JWT-based with cookie + token support)
- User profile management (fitness goals, body metrics)
- Web frontend (Next.js)
- Mobile app (React Native with Expo)

### The Gap
Users cannot track their daily physical activity. There's no way to:
- Log daily step counts
- View step history over time
- Track progress toward step goals
- Analyze activity patterns (daily, weekly, monthly)
- Calculate distance walked and calories burned
- Get insights into their activity levels

### User Need
Users need a reliable, performant system to:
1. Log step counts from mobile devices (automatic via pedometer) or web (manual entry)
2. Store historical step data with proper date tracking
3. Query step data by date ranges for analytics
4. Calculate derived metrics (distance, calories, goal progress)
5. Handle timezone differences correctly
6. Prevent duplicate entries for the same day
7. Support updating step counts throughout the day
8. Provide aggregated statistics (weekly totals, monthly averages)

### Business Impact
Step tracking is foundational for:
- Daily user engagement (users check multiple times per day)
- Goal setting and achievement (gamification)
- Activity-based recommendations (AI coaching)
- Social features (challenges, leaderboards)
- Health insights and trends
- Integration with other features (meal planning based on activity)

## PROJECT CONTEXT

### Technical Stack
- **Backend:** Express.js with TypeScript (strict mode)
- **Database:** MySQL 8.0
- **ORM:** Prisma
- **Architecture:** Clean Architecture (entities → use cases → controllers → routes)
- **Validation:** Zod schemas
- **Authentication:** JWT (cookies for web, Bearer tokens for mobile)
- **API Style:** RESTful with consistent response format

### Existing Project Structure
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
└── package.json
```

### Database Connection
```
MySQL running in Docker
Database: fitai_db
User credentials in .env
Prisma for migrations and queries
```

### Current API Endpoints (For Reference)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify
POST   /api/profile/setup
GET    /api/profile/me
PATCH  /api/profile/update
POST   /api/auth/change-password
```

## REQUIREMENTS

### Functional Requirements

#### FR1: Log Daily Steps
- **Endpoint:** POST /api/steps/log
- **Authentication:** Required (JWT)
- **Request Body:**
  ```json
  {
    "date": "2026-02-21",           // ISO date format (YYYY-MM-DD)
    "steps": 8547,                  // Integer, min: 0, max: 100000
    "distanceKm": 6.8,              // Optional, decimal, auto-calculated if not provided
    "caloriesBurned": 340           // Optional, integer, auto-calculated if not provided
  }
  ```
- **Business Rules:**
  - Date must be today or in the past (no future dates)
  - Date cannot be more than 7 days in the past
  - If entry exists for date, UPDATE it (upsert logic)
  - Auto-calculate distanceKm if not provided: steps * 0.0008 km (average stride)
  - Auto-calculate caloriesBurned if not provided: steps * 0.04 calories (average)
  - Round calculated values to 2 decimal places
  - User can only log their own steps (userId from JWT)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "steps": {
        "id": "uuid",
        "userId": "uuid",
        "date": "2026-02-21",
        "steps": 8547,
        "distanceKm": 6.8,
        "caloriesBurned": 340,
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
  }
  ```

#### FR2: Get Today's Steps
- **Endpoint:** GET /api/steps/today
- **Authentication:** Required
- **Query Parameters:** None
- **Business Rules:**
  - Return steps for current date (user's timezone)
  - If no entry for today, return zeros
  - Calculate goal progress (assume default goal: 10,000 steps)
  - Include percentage complete
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "steps": {
        "id": "uuid",
        "date": "2026-02-21",
        "steps": 8547,
        "distanceKm": 6.8,
        "caloriesBurned": 340,
        "goalSteps": 10000,
        "goalProgress": 85.47,
        "goalReached": false
      }
    }
  }
  ```

#### FR3: Get Step History
- **Endpoint:** GET /api/steps/history
- **Authentication:** Required
- **Query Parameters:**
  ```
  startDate (optional): YYYY-MM-DD (default: 7 days ago)
  endDate (optional): YYYY-MM-DD (default: today)
  limit (optional): integer, max 90 (default: 30)
  ```
- **Business Rules:**
  - Return steps within date range, ordered by date DESC
  - Fill gaps: if no entry for a date in range, return { date, steps: 0 }
  - Maximum range: 90 days
  - Validate date formats
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "history": [
        {
          "id": "uuid",
          "date": "2026-02-21",
          "steps": 8547,
          "distanceKm": 6.8,
          "caloriesBurned": 340
        },
        {
          "date": "2026-02-20",
          "steps": 0,
          "distanceKm": 0,
          "caloriesBurned": 0
        }
      ],
      "totalDays": 7,
      "totalSteps": 45230,
      "averageSteps": 6461
    }
  }
  ```

#### FR4: Get Step Statistics
- **Endpoint:** GET /api/steps/stats
- **Authentication:** Required
- **Query Parameters:**
  ```
  period: 'week' | 'month' | 'year' (default: 'week')
  ```
- **Business Rules:**
  - Week: Last 7 days including today
  - Month: Last 30 days including today
  - Year: Last 365 days including today
  - Calculate: total steps, average steps, total distance, total calories
  - Calculate: best day (most steps), current streak
  - Current streak: consecutive days with >= 1 step
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "period": "week",
      "stats": {
        "totalSteps": 45230,
        "averageSteps": 6461,
        "totalDistanceKm": 36.18,
        "totalCalories": 1809,
        "bestDay": {
          "date": "2026-02-19",
          "steps": 12450
        },
        "currentStreak": 5,
        "daysWithActivity": 7,
        "goalReachedDays": 3
      }
    }
  }
  ```

#### FR5: Update Step Count
- **Endpoint:** PATCH /api/steps/:id
- **Authentication:** Required
- **Path Parameter:** id (step entry ID)
- **Request Body:** Same as POST /api/steps/log (partial update)
- **Business Rules:**
  - User can only update their own entries
  - Cannot change date
  - Recalculate distance/calories if steps change
  - Update timestamp updated_at
- **Success Response (200):** Same as FR1

#### FR6: Delete Step Entry
- **Endpoint:** DELETE /api/steps/:id
- **Authentication:** Required
- **Business Rules:**
  - User can only delete their own entries
  - Soft delete (mark as deleted, keep for analytics)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Step entry deleted successfully"
    }
  }
  ```

### Non-Functional Requirements

#### NFR1: Performance
- All endpoints respond within 200ms (p95)
- Database queries use proper indexes
- No N+1 query problems
- Efficient date range queries

#### NFR2: Data Integrity
- Unique constraint: (userId, date)
- Foreign key constraint: userId → users.id
- No orphaned records
- Transactions for multi-step operations

#### NFR3: Validation
- Comprehensive Zod schemas for all inputs
- Type-safe throughout (TypeScript strict mode)
- Meaningful error messages
- Input sanitization

#### NFR4: Error Handling
- Consistent error response format
- Proper HTTP status codes
- Logged errors (Winston)
- No sensitive data in error messages

#### NFR5: Security
- Authentication required for all endpoints
- Authorization: users can only access their own data
- SQL injection prevention (Prisma)
- Input validation against malicious data

#### NFR6: Maintainability
- Clean Architecture separation
- Well-documented code
- Reusable components
- Unit testable

## DATABASE DESIGN

### New Table: daily_steps

```prisma
model DailySteps {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  date            DateTime @db.Date
  steps           Int      @default(0)
  distanceKm      Float?   @map("distance_km") @db.Decimal(6, 2)
  caloriesBurned  Int?     @map("calories_burned")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
  @@index([userId, date])
  @@map("daily_steps")
}
```

### Update Existing User Model
```prisma
model User {
  // ... existing fields
  dailySteps      DailySteps[]
}
```

### Migration Strategy
1. Create migration: `npx prisma migrate dev --name add_daily_steps`
2. Test migration on dev database
3. Verify indexes created
4. Check foreign key constraints

## DELIVERABLES

### 1. Database Schema & Migration
**File:** `prisma/schema.prisma`
- Add DailySteps model with all fields
- Add relation to User model
- Proper indexes for performance
- Unique constraint on (userId, date)

**File:** Migration file (auto-generated by Prisma)
- Up migration
- Down migration (rollback)

### 2. Domain Layer
**File:** `src/domain/entities/DailySteps.ts`
```typescript
export interface DailySteps {
  id: string;
  userId: string;
  date: Date;
  steps: number;
  distanceKm?: number;
  caloriesBurned?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**File:** `src/domain/interfaces/IDailyStepsRepository.ts`
```typescript
export interface IDailyStepsRepository {
  logSteps(data: LogStepsData): Promise<DailySteps>;
  getStepsByDate(userId: string, date: Date): Promise<DailySteps | null>;
  getStepsHistory(userId: string, startDate: Date, endDate: Date): Promise<DailySteps[]>;
  getStepsStats(userId: string, period: StatsPeriod): Promise<StepsStats>;
  updateSteps(id: string, userId: string, data: UpdateStepsData): Promise<DailySteps>;
  deleteSteps(id: string, userId: string): Promise<void>;
}
```

### 3. Infrastructure Layer
**File:** `src/infrastructure/repositories/DailyStepsRepository.ts`
- Implement IDailyStepsRepository
- Use Prisma client
- Handle upsert logic (update if exists, create if not)
- Efficient queries with proper WHERE clauses
- Error handling with custom errors

### 4. Application Layer (Use Cases)
**File:** `src/application/use-cases/LogSteps.ts`
- Validate input data
- Check date constraints (not future, not too old)
- Calculate distance and calories if not provided
- Call repository.logSteps()
- Return success/error

**File:** `src/application/use-cases/GetTodaySteps.ts`
- Get current date
- Call repository.getStepsByDate()
- Calculate goal progress
- Return formatted response

**File:** `src/application/use-cases/GetStepsHistory.ts`
- Validate date range
- Call repository.getStepsHistory()
- Fill gaps with zero entries
- Calculate totals and averages
- Return formatted response

**File:** `src/application/use-cases/GetStepsStats.ts`
- Determine date range based on period
- Call repository.getStepsStats()
- Calculate streak
- Find best day
- Return formatted response

**File:** `src/application/use-cases/UpdateSteps.ts`
- Validate user owns entry
- Validate new data
- Recalculate metrics
- Call repository.updateSteps()
- Return updated entry

**File:** `src/application/use-cases/DeleteSteps.ts`
- Validate user owns entry
- Call repository.deleteSteps()
- Return success

### 5. Presentation Layer

**File:** `src/presentation/validators/stepsValidators.ts`
```typescript
import { z } from 'zod';

export const logStepsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  steps: z.number().int().min(0).max(100000),
  distanceKm: z.number().min(0).max(200).optional(),
  caloriesBurned: z.number().int().min(0).max(10000).optional(),
});

export const getHistorySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().int().min(1).max(90).optional(),
});

export const getStatsSchema = z.object({
  period: z.enum(['week', 'month', 'year']).optional(),
});
```

**File:** `src/presentation/controllers/StepsController.ts`
```typescript
export class StepsController {
  async logSteps(req: Request, res: Response): Promise<void>;
  async getTodaySteps(req: Request, res: Response): Promise<void>;
  async getHistory(req: Request, res: Response): Promise<void>;
  async getStats(req: Request, res: Response): Promise<void>;
  async updateSteps(req: Request, res: Response): Promise<void>;
  async deleteSteps(req: Request, res: Response): Promise<void>;
}
```

**File:** `src/presentation/routes/stepsRoutes.ts`
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { StepsController } from '../controllers/StepsController';

const router = Router();
const controller = new StepsController();

router.post('/log', authMiddleware, controller.logSteps);
router.get('/today', authMiddleware, controller.getTodaySteps);
router.get('/history', authMiddleware, controller.getHistory);
router.get('/stats', authMiddleware, controller.getStats);
router.patch('/:id', authMiddleware, controller.updateSteps);
router.delete('/:id', authMiddleware, controller.deleteSteps);

export default router;
```

**File:** `src/app.ts` (Update)
```typescript
import stepsRoutes from './presentation/routes/stepsRoutes';
app.use('/api/steps', stepsRoutes);
```

### 6. Shared Utilities
**File:** `src/shared/utils/stepCalculations.ts`
```typescript
export function calculateDistance(steps: number): number;
export function calculateCalories(steps: number): number;
export function calculateGoalProgress(steps: number, goal: number): number;
export function calculateStreak(history: DailySteps[]): number;
```

**File:** `src/shared/utils/dateHelpers.ts`
```typescript
export function getTodayDate(): Date;
export function isValidDateRange(start: Date, end: Date): boolean;
export function getDaysInRange(start: Date, end: Date): Date[];
export function fillDateGaps(history: DailySteps[], start: Date, end: Date): DailySteps[];
```

### 7. Error Handling
**File:** `src/shared/errors/StepsErrors.ts`
```typescript
export class InvalidDateError extends Error {}
export class FutureDateError extends Error {}
export class DateTooOldError extends Error {}
export class StepsNotFoundError extends Error {}
export class UnauthorizedStepsAccessError extends Error {}
```

### 8. Types
**File:** `src/shared/types/steps.types.ts`
```typescript
export type StatsPeriod = 'week' | 'month' | 'year';
export type LogStepsData = { ... };
export type UpdateStepsData = { ... };
export type StepsStats = { ... };
```

## TESTING REQUIREMENTS

### Unit Tests (Optional but Recommended)
- Test use cases with mocked repositories
- Test calculations (distance, calories, streak)
- Test date validations
- Test error scenarios

### Manual Testing Checklist
1. Log steps for today → Success
2. Log steps for same day again → Updates existing
3. Log steps with future date → Error
4. Log steps from 8 days ago → Error
5. Get today's steps → Returns correct data
6. Get history for 7 days → Returns 7 entries (with gaps filled)
7. Get stats for week → Calculates correctly
8. Update steps → Success
9. Delete steps → Success
10. Try to access another user's steps → Error (401)

### Postman Collection
Create collection with all 6 endpoints:
- Environment variables: baseURL, authToken
- Pre-request scripts for auth token
- Tests for response validation

## SUCCESS CRITERIA

✅ All 6 API endpoints working correctly  
✅ Database migration successful  
✅ Unique constraint enforced (no duplicate date entries per user)  
✅ Calculations accurate (distance, calories, streak)  
✅ Authorization working (users can't access others' data)  
✅ Validation preventing invalid data  
✅ Error responses consistent and meaningful  
✅ Clean Architecture maintained  
✅ TypeScript strict mode with no errors  
✅ Can test all endpoints in Postman successfully  

## ACCEPTANCE TESTING SCENARIO

**Scenario:** User tracks steps over a week

1. **Day 1:** User logs 8,000 steps
   - POST /api/steps/log → Success
   - GET /api/steps/today → Shows 8,000 steps, 80% to goal

2. **Day 1 (Later):** Mobile app updates to 10,500 steps
   - POST /api/steps/log (same date) → Updates to 10,500
   - GET /api/steps/today → Shows 10,500, goal reached

3. **Day 7:** User checks weekly progress
   - GET /api/steps/history?startDate=day1&endDate=day7 → 7 entries
   - GET /api/steps/stats?period=week → Shows totals, average, streak

4. **Edge Cases:**
   - Try to log future date → Error 400
   - Try to access friend's steps → Error 401
   - Query 100 days history → Error 400 (max 90)

## IMPLEMENTATION NOTES

### Best Practices
1. **Use transactions** for operations that modify multiple records
2. **Index optimization** on (userId, date) for fast queries
3. **Batch queries** when possible (don't query in loops)
4. **Cache today's goal** (could be user preference later)
5. **Timezone handling** - store dates as UTC, convert in application layer
6. **Logging** - Log all errors and important operations
7. **Input sanitization** - Trim strings, validate formats

### Common Pitfalls to Avoid
- ❌ N+1 queries when fetching history
- ❌ Not handling timezone differences
- ❌ Allowing future dates
- ❌ Not validating user ownership before updates/deletes
- ❌ Inconsistent error responses
- ❌ Missing indexes causing slow queries
- ❌ Not handling edge cases (leap years, month boundaries)

### Performance Considerations
- Use `findUnique` instead of `findFirst` when possible
- Use `select` to only fetch needed fields
- Use database-level calculations (SUM, AVG) instead of in-memory
- Consider pagination for large date ranges (though capped at 90 days)

## TIMELINE ESTIMATE

**Total Time:** 1.5 - 2 hours

- Database schema + migration: 15 minutes
- Domain layer (entities, interfaces): 10 minutes
- Infrastructure (repository): 20 minutes
- Application (use cases): 30 minutes
- Presentation (controllers, routes, validators): 25 minutes
- Shared utilities: 10 minutes
- Testing: 15 minutes

## DEPENDENCIES

### Existing
- Prisma ORM (already installed)
- Zod validation (already installed)
- JWT authentication (already implemented)
- Express + TypeScript (already setup)

### New (None Required)
All functionality can be built with existing dependencies.

## POST-IMPLEMENTATION

### Documentation
- Update API documentation with new endpoints
- Add example requests/responses
- Document calculation formulas

### Frontend Integration Points
Mobile app will need:
- Expo pedometer integration
- Call POST /api/steps/log periodically
- Display GET /api/steps/today on dashboard
- Show charts from GET /api/steps/history

Web app will need:
- Manual step entry form
- Step history page with charts
- Statistics dashboard

### Future Enhancements (Not in Scope)
- Custom step goals per user
- Weekly challenges
- Social comparison (leaderboard)
- AI insights based on patterns
- Integration with other fitness apps
- Export data to CSV/PDF

## DELIVERABLE FORMAT

Provide all code files organized by layer:
1. Database schema update
2. Domain layer files
3. Infrastructure layer files
4. Application layer files
5. Presentation layer files
6. Shared utilities
7. Route registration in app.ts

Each file should:
- Have complete implementation (no TODOs)
- Include all imports
- Have TypeScript types
- Include error handling
- Follow existing code style
- Have brief comments explaining complex logic

End with migration command and testing instructions.