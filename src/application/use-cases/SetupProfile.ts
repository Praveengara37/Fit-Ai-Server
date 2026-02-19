import {
    ISetupProfile,
    SetupProfileInput,
} from '../../domain/interfaces/use-cases/ISetupProfile';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { BadRequestError } from '../../shared/errors/BadRequestError';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { logger } from '../../config/logger';

/**
 * Setup Profile Use Case
 * Handles user profile creation business logic
 */
export class SetupProfile implements ISetupProfile {
    constructor(private userRepository: IUserRepository) { }

    /**
     * Execute profile setup
     * @param userId - Authenticated user ID
     * @param input - Profile data
     * @returns Created profile
     */
    async execute(userId: string, input: SetupProfileInput): Promise<UserProfile> {
        // Verify user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check if profile already exists
        const existingProfile = await this.userRepository.findProfileByUserId(userId);
        if (existingProfile) {
            logger.warn(`Profile setup failed: Profile already exists for user ${userId}`);
            throw new BadRequestError('Profile already exists');
        }

        // Validate age (must be 13+)
        if (input.dateOfBirth) {
            const age = this.calculateAge(input.dateOfBirth);
            if (age < 13) {
                throw new BadRequestError('User must be at least 13 years old');
            }
        }

        // Create profile
        const profile = await this.userRepository.createProfile({
            userId,
            ...input,
        });

        logger.info(`Profile created successfully for user: ${userId}`);

        return profile;
    }

    /**
     * Calculate age from date of birth
     * @param dateOfBirth - Date of birth
     * @returns Age in years
     */
    private calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }
}
