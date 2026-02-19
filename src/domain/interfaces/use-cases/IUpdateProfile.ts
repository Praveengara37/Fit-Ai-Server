import { UserProfile } from '../../entities/UserProfile';

/**
 * Input data for updating user profile
 * All fields are optional, but at least one must be provided
 */
export interface UpdateProfileInput {
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    heightCm?: number;
    currentWeightKg?: number;
    targetWeightKg?: number;
    fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'get_fit';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    dietaryPreference?: 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'halal' | null;
}

/**
 * Update Profile Use Case Interface
 * Updates existing user profile with partial data
 */
export interface IUpdateProfile {
    /**
     * Execute the update profile use case
     * @param userId - ID of the user whose profile to update
     * @param input - Partial profile data to update
     * @returns Updated user profile
     * @throws BadRequestError if no fields provided or validation fails
     * @throws NotFoundError if profile doesn't exist
     */
    execute(userId: string, input: UpdateProfileInput): Promise<UserProfile>;
}
