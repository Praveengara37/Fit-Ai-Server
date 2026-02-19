import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/authMiddleware';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/authValidators';

/**
 * Create authentication routes
 * @param authController - Authentication controller instance
 * @returns Express router
 */
export const createAuthRoutes = (authController: AuthController): Router => {
    const router = Router();

    /**
     * POST /api/auth/register
     * Register a new user
     */
    router.post('/register', validate(registerSchema), authController.register);

    /**
     * POST /api/auth/login
     * Login user
     */
    router.post('/login', validate(loginSchema), authController.login);

    /**
     * POST /api/auth/logout
     * Logout user
     */
    router.post('/logout', authController.logout);

    /**
     * GET /api/auth/verify
     * Verify authentication status (protected)
     */
    router.get('/verify', authMiddleware, authController.verify);

    /**
     * POST /api/auth/change-password
     * Change user password (protected)
     */
    router.post('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

    return router;
};
