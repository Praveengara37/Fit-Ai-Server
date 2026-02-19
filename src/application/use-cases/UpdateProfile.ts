import { IUpdateProfile, UpdateProfileInput } from '../../domain/interfaces/use-cases/IUpdateProfile';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { BadRequestError } from '../../shared/errors/BadRequestError';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { logger } from '../../config/logger';

/**
 * Update Profile Use Case
 * Updates existing user profile with partial data
 */
export class UpdateProfile implements IUpdateProfile {
    constructor(private userRepository: IUserRepository) { }

    /**
     * Execute update profile use case
     */
    async execute(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
        // Validate at least one field is provided
        const hasAtLeastOneField = Object.keys(input).length > 0;
        if (!hasAtLeastOneField) {
            throw new BadRequestError('At least one field must be provided for update');
        }

        // Check if profile exists
        const existingProfile = await this.userRepository.findProfileByUserId(userId);
        if (!existingProfile) {
            throw new NotFoundError('Profile not found. Please create a profile first.');
        }

        // Validate age if dateOfBirth is provided
        if (input.dateOfBirth) {
            const birthDate = new Date(input.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (age < 13 || (age === 13 && monthDiff < 0)) {
                throw new BadRequestError('User must be at least 13 years old');
            }
        }

        // Update profile
        const updatedProfile = await this.userRepository.updateProfile(userId, input);

        if (!updatedProfile) {
            throw new NotFoundError('Failed to update profile');
        }

        logger.info(`Profile updated for user: ${userId}`);

        return updatedProfile;
    }
}
