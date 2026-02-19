# FitAI Backend Development Prompt

> Complete prompt for building FitAI backend with Clean Architecture, TypeScript, Express, MySQL, and Cookie-based Authentication

---

## Project Overview

**Project Name:** FitAI - AI-Powered Fitness & Nutrition Platform  
**Task:** Build user registration/authentication (with HTTP-only cookie auth) and fitness goal setup system  
**Architecture:** Clean Architecture with SOLID Principles

---

## Instructions for AI Assistant

You are a senior backend developer with 10+ years of experience in Node.js, TypeScript, Express, and MySQL. You specialize in clean architecture, SOLID principles, and building scalable REST APIs.

---

## Technical Stack

- **Language:** TypeScript (strict mode)
- **Framework:** Express.js
- **Database:** MySQL 8.0 (running in Docker)
- **ORM:** Prisma
- **Architecture:** Clean Architecture (Entities → Use Cases → Controllers → Routes)
- **Validation:** Zod
- **Auth:** JWT stored in HTTP-only cookies (NOT localStorage)
- **Password:** bcrypt (salt rounds: 10)
- **Logging:** Winston
- **Environment:** dotenv
- **UUID:** uuid v4
- **Cookies:** cookie-parser
- **CORS:** cors (with credentials support)

---

## Folder Structure

```
fitai-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   └── UserProfile.ts
│   │   └── interfaces/
│   │       ├── repositories/
│   │       │   └── IUserRepository.ts
│   │       └── use-cases/
│   │           ├── IRegisterUser.ts
│   │           ├── IAuthenticateUser.ts
│   │           └── ISetupProfile.ts
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── UserRepository.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── RegisterUser.ts
│   │       ├── AuthenticateUser.ts
│   │       └── SetupProfile.ts
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   └── ProfileController.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── profile.routes.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── authMiddleware.ts
│   │   │   ├── validation.ts
│   │   │   └── requestLogger.ts
│   │   └── validators/
│   │       ├── authValidators.ts
│   │       └── profileValidators.ts
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── response.ts
│   │   │   └── cookie.ts
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   ├── BadRequestError.ts
│   │   │   ├── UnauthorizedError.ts
│   │   │   └── NotFoundError.ts
│   │   └── types/
│   │       └── express.d.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Database Configuration

**MySQL Docker Connection:**
```
Host: localhost
Port: 3306
Database: fitai_db
User: fitai_user
Password: fitai_pass_123
```

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  fullName     String    @map("full_name") @db.VarChar(255)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  profile      UserProfile?

  @@index([email])
  @@map("users")
}

model UserProfile {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  dateOfBirth        DateTime? @map("date_of_birth") @db.Date
  gender             Gender?
  heightCm           Decimal?  @map("height_cm") @db.Decimal(5, 2)
  currentWeightKg    Decimal?  @map("current_weight_kg") @db.Decimal(5, 2)
  targetWeightKg     Decimal?  @map("target_weight_kg") @db.Decimal(5, 2)
  fitnessGoal        FitnessGoal @map("fitness_goal")
  activityLevel      ActivityLevel @map("activity_level")
  dietaryPreference  DietaryPreference? @map("dietary_preference")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_profiles")
}

enum Gender {
  male
  female
  other
  prefer_not_to_say
}

enum FitnessGoal {
  lose_weight
  gain_muscle
  maintain
  get_fit
}

enum ActivityLevel {
  sedentary
  light
  moderate
  active
  very_active
}

enum DietaryPreference {
  none
  vegetarian
  vegan
  keto
  paleo
  halal
}
```

---

## API Endpoints

### 1. POST /api/auth/register
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Validations:**
- email: valid email format, max 255 chars
- password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
- fullName: min 2 chars, max 255 chars

**Success Response (201):**
Sets HTTP-only cookie: `auth_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

**Error Responses:**
- 400: Validation error or email already exists
- 500: Internal server error

---

### 2. POST /api/auth/login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
Sets HTTP-only cookie: `auth_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

**Error Responses:**
- 400: Validation error
- 401: Invalid credentials
- 500: Internal server error

---

### 3. POST /api/auth/logout
**Success Response (200):**
Clears cookie: `auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 4. GET /api/auth/verify
**Cookie:** `auth_token=<jwt>` (automatically sent by browser)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

**Purpose:** Frontend uses this to check if user is logged in on page load

---

### 5. POST /api/profile/setup (Protected)
**Cookie:** `auth_token=<jwt>` (automatically sent by browser)

**Request Body:**
```json
{
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "heightCm": 175.5,
  "currentWeightKg": 80.0,
  "targetWeightKg": 75.0,
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate",
  "dietaryPreference": "none"
}
```

**Validations:**
- dateOfBirth: valid date, user must be 13+ years old
- gender: enum value or null
- heightCm: 50-300 range
- currentWeightKg: 20-500 range
- targetWeightKg: 20-500 range
- fitnessGoal: required enum
- activityLevel: required enum
- dietaryPreference: enum or null

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "userId": "uuid",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "heightCm": 175.5,
      "currentWeightKg": 80.0,
      "targetWeightKg": 75.0,
      "fitnessGoal": "lose_weight",
      "activityLevel": "moderate",
      "dietaryPreference": "none"
    }
  }
}
```

**Error Responses:**
- 400: Validation error or profile already exists
- 401: Unauthorized (invalid/missing cookie)
- 500: Internal server error

---

### 6. GET /api/profile/me (Protected)
**Cookie:** `auth_token=<jwt>` (automatically sent by browser)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "profile": {
      "id": "uuid",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "heightCm": 175.5,
      "currentWeightKg": 80.0,
      "targetWeightKg": 75.0,
      "fitnessGoal": "lose_weight",
      "activityLevel": "moderate",
      "dietaryPreference": "none"
    }
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 404: Profile not found
- 500: Internal server error

---

## Environment Variables

**`.env` file:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://fitai_user:fitai_pass_123@localhost:3306/fitai_db"
JWT_SECRET=fitai_super_secret_key_min_32_characters_long
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10
LOG_LEVEL=debug
COOKIE_NAME=auth_token
FRONTEND_URL=http://localhost:5173
```

---

## Cookie Configuration

**Cookie Settings:**
- **httpOnly:** `true` (prevents XSS attacks)
- **secure:** `true` in production (HTTPS only)
- **sameSite:** `'strict'` (CSRF protection)
- **maxAge:** 7 days (604800000 milliseconds)
- **path:** `/`

**Cookie Utility Implementation (src/shared/utils/cookie.ts):**
```typescript
import { Response } from 'express';
import { config } from '../../config/env';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(config.cookieName || 'auth_token', token, COOKIE_OPTIONS);
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(config.cookieName || 'auth_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/'
  });
};
```

---

## CORS Configuration

**CRITICAL for Cookie Authentication:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // CRITICAL: Allows cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
```

---

## Auth Middleware Implementation

**IMPORTANT:** Must read JWT from cookie, NOT from Authorization header

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/jwt';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { config } from '../../config/env';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Read token from cookie (NOT Authorization header)
    const token = req.cookies[config.cookieName || 'auth_token'];
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }
    
    // Verify token
    const payload = verifyToken(token);
    
    // Attach user to request
    req.user = {
      id: payload.userId,
      email: payload.email
    };
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
```

---

## Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Actual response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional validation details
  }
}
```

---

## Code Requirements

### 1. Clean Architecture Principles
- **Entities:** Pure domain models, no dependencies
- **Use Cases:** Business logic, depend on interfaces only
- **Controllers:** Thin layer, handle HTTP, set/clear cookies
- **Repositories:** Database operations via Prisma

### 2. Dependency Injection
- All dependencies passed via constructors
- No hard-coded dependencies
- Easy to test and swap implementations

### 3. Cookie Security
- Always use `httpOnly` flag
- Use `secure` flag in production
- Use `sameSite='strict'` for CSRF protection
- Clear cookies on logout
- Short expiry time (7 days max)

### 4. Error Handling
- Custom error classes extending `AppError`
- Centralized error handler middleware
- Consistent error response format
- Log all errors with Winston

### 5. Security Best Practices
- Hash passwords with bcrypt (10 rounds)
- JWT tokens with 7 day expiry
- Validate all inputs with Zod
- Never return `password_hash` in responses
- SQL injection protection via Prisma
- CORS configured for credentials

### 6. Code Quality Standards
- TypeScript strict mode enabled
- No `any` types unless absolutely necessary
- JSDoc comments for all public methods
- Meaningful variable/function names
- Max 20 lines per function
- Single Responsibility Principle
- DRY principle (Don't Repeat Yourself)

### 7. Logging Standards
- Log all incoming requests (method, path, duration, status)
- Log all errors with stack traces
- Use Winston with different log levels (debug, info, warn, error)
- **NEVER** log sensitive data (passwords, tokens, cookies)

---

## Required Dependencies

**Production Dependencies:**
- `express` - Web framework
- `typescript` - TypeScript support
- `prisma` - Database ORM
- `@prisma/client` - Prisma client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `zod` - Schema validation
- `winston` - Logging
- `dotenv` - Environment variables
- `cookie-parser` - Parse cookies
- `cors` - CORS support
- `uuid` - UUID generation

**Dev Dependencies:**
- `@types/node`
- `@types/express`
- `@types/bcrypt`
- `@types/jsonwebtoken`
- `@types/cookie-parser`
- `@types/cors`
- `ts-node` - Run TypeScript
- `ts-node-dev` - Dev server with hot reload
- `eslint` - Code linting
- `prettier` - Code formatting
- `@typescript-eslint/parser`
- `@typescript-eslint/eslint-plugin`

---

## Step-by-Step Deliverables

### STEP 1: Project Setup Files
- `package.json` (all dependencies with exact versions)
- `tsconfig.json`
- `.eslintrc.js`
- `.prettierrc`
- `.gitignore`
- `.env.example`

### STEP 2: Database Setup
- `prisma/schema.prisma` (complete schema)
- Commands to run migrations

### STEP 3: Configuration Layer
- `src/config/database.ts` (Prisma client singleton)
- `src/config/env.ts` (Zod validation for all env vars)
- `src/config/logger.ts` (Winston setup)

### STEP 4: Shared Layer - Errors
- `src/shared/errors/AppError.ts`
- `src/shared/errors/BadRequestError.ts`
- `src/shared/errors/UnauthorizedError.ts`
- `src/shared/errors/NotFoundError.ts`

### STEP 5: Shared Layer - Utilities
- `src/shared/utils/password.ts` (hash & compare with bcrypt)
- `src/shared/utils/jwt.ts` (sign & verify)
- `src/shared/utils/cookie.ts` (setAuthCookie & clearAuthCookie)
- `src/shared/utils/response.ts` (success & error response helpers)

### STEP 6: Shared Layer - Types
- `src/shared/types/express.d.ts` (extend Request type with user property)

### STEP 7: Domain Layer - Entities
- `src/domain/entities/User.ts`
- `src/domain/entities/UserProfile.ts`

### STEP 8: Domain Layer - Interfaces
- `src/domain/interfaces/repositories/IUserRepository.ts`
- `src/domain/interfaces/use-cases/IRegisterUser.ts`
- `src/domain/interfaces/use-cases/IAuthenticateUser.ts`
- `src/domain/interfaces/use-cases/ISetupProfile.ts`

### STEP 9: Infrastructure Layer
- `src/infrastructure/repositories/UserRepository.ts` (Prisma implementation)

### STEP 10: Application Layer - Use Cases
- `src/application/use-cases/RegisterUser.ts`
- `src/application/use-cases/AuthenticateUser.ts`
- `src/application/use-cases/SetupProfile.ts`

### STEP 11: Presentation Layer - Validators
- `src/presentation/validators/authValidators.ts` (Zod schemas)
- `src/presentation/validators/profileValidators.ts` (Zod schemas)

### STEP 12: Presentation Layer - Middleware
- `src/presentation/middleware/errorHandler.ts`
- `src/presentation/middleware/authMiddleware.ts` (reads from cookie!)
- `src/presentation/middleware/validation.ts`
- `src/presentation/middleware/requestLogger.ts`

### STEP 13: Presentation Layer - Controllers
- `src/presentation/controllers/AuthController.ts` (sets/clears cookies)
- `src/presentation/controllers/ProfileController.ts`

### STEP 14: Presentation Layer - Routes
- `src/presentation/routes/auth.routes.ts`
- `src/presentation/routes/profile.routes.ts`

### STEP 15: Application Entry Points
- `src/app.ts` (Express app setup with cookie-parser and CORS)
- `src/server.ts` (Start server)

### STEP 16: Documentation
- `README.md` (setup instructions, API documentation, architecture explanation)

---

## Implementation Instructions

For each file, provide:
1. ✅ Complete implementation (no placeholders or TODOs)
2. ✅ All necessary imports
3. ✅ Full error handling
4. ✅ JSDoc comments for public methods
5. ✅ Type safety (strict TypeScript)
6. ✅ Cookie handling where applicable

---

## Important Notes

### ⚠️ CRITICAL Points
1. **Cookie-parser MUST be installed and configured** in `app.ts`
2. **CORS MUST have `credentials: true`** to allow cookies
3. **Auth middleware MUST read from `req.cookies`**, NOT Authorization header
4. **Controllers MUST use cookie helper functions** (setAuthCookie, clearAuthCookie)
5. **Never log sensitive data** (passwords, tokens, cookies)

### 🔐 Security Checklist
- [ ] Passwords hashed with bcrypt (10 rounds)
- [ ] JWT stored in HTTP-only cookies
- [ ] Cookies have `secure` flag in production
- [ ] Cookies have `sameSite='strict'`
- [ ] All inputs validated with Zod
- [ ] CORS configured for credentials
- [ ] No `password_hash` in responses
- [ ] SQL injection protected via Prisma

---

## Testing Commands

### Using curl with cookies:

```bash
# 1. Register (saves cookie to file)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe"
  }'

# 2. Login (saves cookie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 3. Verify Auth (uses cookie)
curl -X GET http://localhost:3000/api/auth/verify \
  -b cookies.txt

# 4. Setup Profile (uses cookie from file)
curl -X POST http://localhost:3000/api/profile/setup \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "heightCm": 175.5,
    "currentWeightKg": 80.0,
    "targetWeightKg": 75.0,
    "fitnessGoal": "lose_weight",
    "activityLevel": "moderate",
    "dietaryPreference": "none"
  }'

# 5. Get Profile (uses cookie)
curl -X GET http://localhost:3000/api/profile/me \
  -b cookies.txt

# 6. Logout (clears cookie)
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your actual values

# 3. Setup Prisma
npx prisma generate
npx prisma db push

# 4. Start development server
npm run dev

# 5. Verify in phpMyAdmin
# Open http://localhost:8080
# Check tables: users, user_profiles
```

---

## Success Checklist

- [ ] MySQL & phpMyAdmin running (`docker ps`)
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma migrations applied (`npx prisma db push`)
- [ ] Tables visible in phpMyAdmin
- [ ] Server starts without errors (`npm run dev`)
- [ ] Can register a user (check cookies in browser/curl)
- [ ] Can login and get cookie set
- [ ] Can setup fitness profile with cookie
- [ ] Can view profile with cookie
- [ ] Can logout and cookie is cleared
- [ ] Data visible in phpMyAdmin

---

## Architecture Benefits

### Why Clean Architecture?
- ✅ **Testability:** Each layer can be tested independently
- ✅ **Maintainability:** Changes in one layer don't affect others
- ✅ **Scalability:** Easy to add new features
- ✅ **Flexibility:** Easy to swap implementations (e.g., change ORM)
- ✅ **Clarity:** Clear separation of concerns

### Why Cookie-based Auth?
- ✅ **Security:** HTTP-only prevents XSS attacks
- ✅ **Automatic:** Browser handles sending cookies
- ✅ **CSRF Protection:** SameSite attribute
- ✅ **Server Control:** Backend manages expiry
- ✅ **No Client Storage:** No localStorage vulnerabilities

---

## Next Steps After Completion

1. ✅ Build frontend (React/Next.js)
2. ✅ Add meal tracking features
3. ✅ Add workout tracking features
4. ✅ Integrate AI features (Claude API)
5. ✅ Add notifications system
6. ✅ Add location-based features (gym finder)
7. ✅ Deploy to production

---

## Support & Contact

**Project:** FitAI Backend  
**Version:** 1.0.0  
**Last Updated:** 2025  

---

**Start with STEP 1 NOW. Give me the complete package.json with all dependencies and exact versions.**
