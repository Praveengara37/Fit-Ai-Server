# FitAI Backend

AI-Powered Fitness & Nutrition Platform Backend API built with clean architecture, TypeScript, Express, Prisma, and MySQL.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── config/          # Configuration (env, database, logger)
├── domain/          # Business entities and interfaces
├── infrastructure/  # External dependencies (Prisma repositories)
├── application/     # Use cases (business logic)
├── presentation/    # HTTP layer (controllers, routes, middleware)
└── shared/          # Shared utilities (errors, utils, types)
```

## 🔐 Authentication

- **HTTP-only cookies** for JWT storage (secure, XSS-protected)
- **bcrypt** password hashing (10 rounds)
- **CORS** configured with `credentials: true`
- **7-day** token expiry

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Docker Desktop (for MySQL)
- npm >= 9.0.0

### Installation

1. **Start Docker services** (MySQL + phpMyAdmin):
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your JWT secret (min 32 characters).

4. **Setup database**:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

Server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Logout
```bash
POST /api/auth/logout
```

#### Verify Auth
```bash
GET /api/auth/verify
```

### Profile (Protected Routes)

#### Setup Profile
```bash
POST /api/profile/setup
Content-Type: application/json

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

#### Get Profile
```bash
GET /api/profile/me
```

## 🧪 Testing with cURL

```bash
# 1. Register (saves cookie)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@fitai.com","password":"SecurePass123","fullName":"Test User"}'

# 2. Login (saves cookie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@fitai.com","password":"SecurePass123"}'

# 3. Verify auth (uses cookie)
curl -X GET http://localhost:3000/api/auth/verify -b cookies.txt

# 4. Setup profile (uses cookie)
curl -X POST http://localhost:3000/api/profile/setup \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"dateOfBirth":"1990-01-15","gender":"male","heightCm":175.5,"currentWeightKg":80.0,"targetWeightKg":75.0,"fitnessGoal":"lose_weight","activityLevel":"moderate","dietaryPreference":"none"}'

# 5. Get profile (uses cookie)
curl -X GET http://localhost:3000/api/profile/me -b cookies.txt

# 6. Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt -c cookies.txt
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:push       # Push schema to database
npm run prisma:studio     # Open Prisma Studio GUI
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🗄️ Database

MySQL is running in Docker:
- **Host**: localhost:3306
- **Database**: fitai_db
- **User**: fitai_user
- **Password**: praveen_fit_ai

**phpMyAdmin** (GUI):
- **URL**: http://localhost:8080
- **Username**: fitai_user
- **Password**: praveen_fit_ai

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | MySQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRY` | Token expiry time | Yes |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | Yes |
| `COOKIE_NAME` | Auth cookie name | Yes |
| `LOG_LEVEL` | Logging level | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## 📝 Key Features

✅ Clean Architecture with dependency injection  
✅ Cookie-based JWT authentication (HTTP-only, secure)  
✅ Zod validation for all inputs  
✅ Comprehensive error handling  
✅ Request/response logging with Winston  
✅ TypeScript strict mode  
✅ Prisma ORM with MySQL  
✅ CORS configured for credentials  
✅ Graceful shutdown handling  

## 📖 Architecture Benefits

- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features
- **Flexibility**: Easy to swap implementations (e.g., change ORM)
- **Security**: HTTP-only cookies prevent XSS, proper password hashing, input validation

## 🤝 License

MIT

---

**Built with ❤️ for FitAI**
