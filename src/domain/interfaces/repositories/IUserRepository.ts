import { User, CreateUserData } from '../../entities/User';
import { UserProfile, CreateUserProfileData } from '../../entities/UserProfile';

/**
 * User Repository Interface
 * Defines contract for user data access
 */
export interface IUserRepository {
    /**
     * Find user by email
     * @param email - User email
     * @returns User or null if not found
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Find user by ID
     * @param id - User ID
     * @returns User or null if not found
     */
    findById(id: string): Promise<User | null>;

    /**
     * Create a new user
     * @param data - User creation data
     * @returns Created user
     */
    create(data: CreateUserData): Promise<User>;

    /**
     * Create user profile
     * @param data - Profile creation data
     * @returns Created profile
     */
    createProfile(data: CreateUserProfileData): Promise<UserProfile>;

    /**
     * Find user profile by user ID
     * @param userId - User ID
     * @returns User profile or null if not found
     */
    findProfileByUserId(userId: string): Promise<UserProfile | null>;

    /**
     * Find user with profile
     * @param userId - User ID
     * @returns User with profile or null if not found
     */
    findUserWithProfile(userId: string): Promise<(User & { profile: UserProfile | null }) | null>;

    /**
     * Find user by ID with password hash (for authentication)
     * @param id - User ID
     * @returns User with password hash or null if not found
     */
    findByIdWithPassword(id: string): Promise<(User & { passwordHash: string }) | null>;

    /**
     * Update user profile with partial data
     * @param userId - User ID
     * @param data - Partial profile data to update
     * @returns Updated profile or null if not found
     */
    updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null>;

    /**
     * Update user password
     * @param userId - User ID
     * @param newPasswordHash - New hashed password
     * @returns Updated user or null if not found
     */
    updatePassword(userId: string, newPasswordHash: string): Promise<User | null>;
}
