import { UserProfile, CreateUserProfileData } from '../../entities/UserProfile';

/**
 * Setup Profile use case input
 */
export interface SetupProfileInput extends Omit<CreateUserProfileData, 'userId'> {
    // userId will be added from authenticated user
}

/**
 * Setup Profile use case interface
 */
export interface ISetupProfile {
    /**
     * Execute profile setup
     * @param userId - Authenticated user ID
     * @param input - Profile data
     * @returns Created profile
     */
    execute(userId: string, input: SetupProfileInput): Promise<UserProfile>;
}
