import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/authMiddleware';
import { setupProfileSchema, updateProfileSchema } from '../validators/profileValidators';

/**
 * Create profile routes
 * All routes are protected by authentication middleware
 * @param profileController - Profile controller instance
 * @returns Express router
 */
export const createProfileRoutes = (profileController: ProfileController): Router => {
    const router = Router();

    /**
     * POST /api/profile/setup
     * Setup user profile (protected)
     */
    router.post('/setup', authMiddleware, validate(setupProfileSchema), profileController.setup);

    /**
     * PATCH /api/profile/update
     * Update user profile (protected)
     */
    router.patch('/update', authMiddleware, validate(updateProfileSchema), profileController.updateProfile);

    /**
     * GET /api/profile/me
     * Get user profile (protected)
     */
    router.get('/me', authMiddleware, profileController.getProfile);

    return router;
};
