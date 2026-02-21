import { Request, Response, NextFunction } from 'express';
import { ISetupProfile } from '../../domain/interfaces/use-cases/ISetupProfile';
import { IUpdateProfile } from '../../domain/interfaces/use-cases/IUpdateProfile';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { successResponse } from '../../shared/utils/response';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { SetupProfileInput, UpdateProfileInput } from '../validators/profileValidators';
import { Gender, FitnessGoal, ActivityLevel, DietaryPreference } from '../../domain/entities/UserProfile';

/**
 * Profile Controller
 * Handles HTTP requests for profile endpoints
 */
export class ProfileController {
    constructor(
        private setupProfileUseCase: ISetupProfile,
        private updateProfileUseCase: IUpdateProfile,
        private userRepository: IUserRepository
    ) { }

    /**
     * Setup user profile
     * POST /api/profile/setup
     */
    setup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new NotFoundError('User not found');
            }

            const input = req.body as SetupProfileInput;

            const useCaseInput = {
                ...input,
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
                gender: input.gender as Gender | undefined,
                fitnessGoal: input.fitnessGoal as FitnessGoal,
                activityLevel: input.activityLevel as ActivityLevel,
                dietaryPreference: input.dietaryPreference as DietaryPreference | undefined,
            };

            // Execute setup profile use case
            const profile = await this.setupProfileUseCase.execute(userId, useCaseInput);

            // Fetch user data for complete response
            const user = await this.userRepository.findById(userId);

            // Return success response with complete user + profile data
            successResponse(res, {
                user: user ? {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    createdAt: user.createdAt,
                } : null,
                profile,
            }, 201);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update user profile
     * PATCH /api/profile/update
     */
    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new NotFoundError('User not found');
            }

            const input = req.body as UpdateProfileInput;

            const useCaseInput = {
                ...input,
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
                gender: input.gender as Gender | undefined,
                fitnessGoal: input.fitnessGoal as FitnessGoal | undefined,
                activityLevel: input.activityLevel as ActivityLevel | undefined,
                dietaryPreference: input.dietaryPreference as DietaryPreference | undefined,
            };

            // Execute update profile use case
            const profile = await this.updateProfileUseCase.execute(userId, useCaseInput as any);

            // Fetch user data for complete response
            const user = await this.userRepository.findById(userId);

            // Return success response with complete user + profile data
            successResponse(res, {
                user: user ? {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    createdAt: user.createdAt,
                } : null,
                profile,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get user profile
     * GET /api/profile/me
     */
    getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new NotFoundError('User not found');
            }

            // Get user with profile
            const userWithProfile = await this.userRepository.findUserWithProfile(userId);

            if (!userWithProfile) {
                throw new NotFoundError('User not found');
            }

            // Return success response
            successResponse(res, {
                user: {
                    id: userWithProfile.id,
                    email: userWithProfile.email,
                    fullName: userWithProfile.fullName,
                    createdAt: userWithProfile.createdAt,
                },
                profile: userWithProfile.profile,
            });
        } catch (error) {
            next(error);
        }
    };
}
