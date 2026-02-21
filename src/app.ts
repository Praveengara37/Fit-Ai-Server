import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config/env';
import { prisma } from './config/database';
import { requestLogger } from './presentation/middleware/requestLogger';
import { errorHandler } from './presentation/middleware/errorHandler';
import { createAuthRoutes } from './presentation/routes/auth.routes';
import { createProfileRoutes } from './presentation/routes/profile.routes';
import { createStepsRoutes } from './presentation/routes/stepsRoutes';

// Import use cases
import { RegisterUser } from './application/use-cases/RegisterUser';
import { AuthenticateUser } from './application/use-cases/AuthenticateUser';
import { SetupProfile } from './application/use-cases/SetupProfile';
import { UpdateProfile } from './application/use-cases/UpdateProfile';
import { ChangePassword } from './application/use-cases/ChangePassword';
import { LogSteps } from './application/use-cases/LogSteps';
import { GetTodaySteps } from './application/use-cases/GetTodaySteps';
import { GetStepsHistory } from './application/use-cases/GetStepsHistory';
import { GetStepsStats } from './application/use-cases/GetStepsStats';
import { UpdateSteps } from './application/use-cases/UpdateSteps';
import { DeleteSteps } from './application/use-cases/DeleteSteps';

// Import repositories
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { DailyStepsRepository } from './infrastructure/repositories/DailyStepsRepository';

// Import controllers
import { AuthController } from './presentation/controllers/AuthController';
import { ProfileController } from './presentation/controllers/ProfileController';
import { StepsController } from './presentation/controllers/StepsController';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
    const app = express();

    // ===== MIDDLEWARE =====

    // CORS configuration (CRITICAL: credentials must be true for cookie-based auth)
    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps, Postman, or same-origin)
                if (!origin) return callback(null, true);

                // List of allowed origins
                const allowedOrigins = [
                    config.FRONTEND_URL,
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:3002',
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://localhost:8081',
                    'exp://192.168.1.22:8081', // Expo Go
                ];

                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    console.warn(`CORS blocked origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true, // CRITICAL: Allow cookies to be sent
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
            exposedHeaders: ['Set-Cookie'],
        })
    );

    // Cookie parser (CRITICAL: Required for reading auth cookies)
    app.use(cookieParser());

    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use(requestLogger);

    // ===== DEPENDENCY INJECTION =====

    // Repository layer
    const userRepository = new UserRepository(prisma);
    const dailyStepsRepository = new DailyStepsRepository(prisma);

    // Application layer (use cases)
    const registerUserUseCase = new RegisterUser(userRepository as any);
    const authenticateUserUseCase = new AuthenticateUser(userRepository as any);
    const setupProfileUseCase = new SetupProfile(userRepository);
    const updateProfileUseCase = new UpdateProfile(userRepository);
    const changePasswordUseCase = new ChangePassword(userRepository as any);

    // Steps Use Cases
    const logStepsUseCase = new LogSteps(dailyStepsRepository);
    const getTodayStepsUseCase = new GetTodaySteps(dailyStepsRepository);
    const getStepsHistoryUseCase = new GetStepsHistory(dailyStepsRepository);
    const getStepsStatsUseCase = new GetStepsStats(dailyStepsRepository);
    const updateStepsUseCase = new UpdateSteps(dailyStepsRepository);
    const deleteStepsUseCase = new DeleteSteps(dailyStepsRepository);

    // Presentation layer (controllers)
    const authController = new AuthController(registerUserUseCase, authenticateUserUseCase, changePasswordUseCase);
    const profileController = new ProfileController(setupProfileUseCase, updateProfileUseCase, userRepository);
    const stepsController = new StepsController(
        logStepsUseCase,
        getTodayStepsUseCase,
        getStepsHistoryUseCase,
        getStepsStatsUseCase,
        updateStepsUseCase,
        deleteStepsUseCase
    );

    // ===== ROUTES =====

    // Health check
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/profile', createProfileRoutes(profileController));
    app.use('/api/steps', createStepsRoutes(stepsController));

    // 404 handler
    app.use((_req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Route not found',
            },
        });
    });

    // ===== ERROR HANDLER =====
    // MUST be the last middleware
    app.use(errorHandler);

    return app;
};
