import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { User, CreateUserData } from '../../domain/entities/User';
import { UserProfile, CreateUserProfileData } from '../../domain/entities/UserProfile';
// Removed unused NotFoundError import

/**
 * User Repository implementation using Prisma
 */
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) { }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
                passwordHash: false,
            },
        });

        return user;
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
                passwordHash: false,
            },
        });

        return user;
    }

    /**
     * Find user by ID with password hash (for authentication)
     */
    async findByIdWithPassword(id: string): Promise<(User & { passwordHash: string }) | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            passwordHash: user.passwordHash,
        };
    }

    /**
     * Find user by email with password hash (for authentication)
     */
    async findByEmailWithPassword(
        email: string
    ): Promise<(User & { passwordHash: string }) | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            passwordHash: user.passwordHash,
        };
    }

    /**
     * Create a new user
     */
    async create(data: CreateUserData): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                fullName: data.fullName,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }

    /**
     * Create user profile
     */
    async createProfile(data: CreateUserProfileData): Promise<UserProfile> {
        const profile = await this.prisma.userProfile.create({
            data: {
                userId: data.userId,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                heightCm: data.heightCm,
                currentWeightKg: data.currentWeightKg,
                targetWeightKg: data.targetWeightKg,
                fitnessGoal: data.fitnessGoal,
                activityLevel: data.activityLevel,
                dietaryPreference: data.dietaryPreference,
            },
        });

        return {
            id: profile.id,
            userId: profile.userId,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender as never,
            heightCm: profile.heightCm ? Number(profile.heightCm) : null,
            currentWeightKg: profile.currentWeightKg ? Number(profile.currentWeightKg) : null,
            targetWeightKg: profile.targetWeightKg ? Number(profile.targetWeightKg) : null,
            fitnessGoal: profile.fitnessGoal as never,
            activityLevel: profile.activityLevel as never,
            dietaryPreference: profile.dietaryPreference as never,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }

    /**
     * Find user profile by user ID
     */
    async findProfileByUserId(userId: string): Promise<UserProfile | null> {
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
        });

        if (!profile) return null;

        return {
            id: profile.id,
            userId: profile.userId,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender as never,
            heightCm: profile.heightCm ? Number(profile.heightCm) : null,
            currentWeightKg: profile.currentWeightKg ? Number(profile.currentWeightKg) : null,
            targetWeightKg: profile.targetWeightKg ? Number(profile.targetWeightKg) : null,
            fitnessGoal: profile.fitnessGoal as never,
            activityLevel: profile.activityLevel as never,
            dietaryPreference: profile.dietaryPreference as never,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }

    /**
     * Find user with profile
     */
    async findUserWithProfile(
        userId: string
    ): Promise<(User & { profile: UserProfile | null }) | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });

        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile
                ? {
                    id: user.profile.id,
                    userId: user.profile.userId,
                    dateOfBirth: user.profile.dateOfBirth,
                    gender: user.profile.gender as never,
                    heightCm: user.profile.heightCm ? Number(user.profile.heightCm) : null,
                    currentWeightKg: user.profile.currentWeightKg
                        ? Number(user.profile.currentWeightKg)
                        : null,
                    targetWeightKg: user.profile.targetWeightKg
                        ? Number(user.profile.targetWeightKg)
                        : null,
                    fitnessGoal: user.profile.fitnessGoal as never,
                    activityLevel: user.profile.activityLevel as never,
                    dietaryPreference: user.profile.dietaryPreference as never,
                    createdAt: user.profile.createdAt,
                    updatedAt: user.profile.updatedAt,
                }
                : null,
        };
    }

    /**
     * Update user profile with partial data
     * @param userId - User ID
     * @param data - Partial profile data to update
     * @returns Updated profile
     */
    async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
        const profile = await this.prisma.userProfile.update({
            where: { userId },
            data: {
                ...(data.dateOfBirth !== undefined && { dateOfBirth: typeof data.dateOfBirth === 'string' ? new Date(data.dateOfBirth) : data.dateOfBirth }),
                ...(data.gender !== undefined && { gender: data.gender }),
                ...(data.heightCm !== undefined && { heightCm: data.heightCm }),
                ...(data.currentWeightKg !== undefined && { currentWeightKg: data.currentWeightKg }),
                ...(data.targetWeightKg !== undefined && { targetWeightKg: data.targetWeightKg }),
                ...(data.fitnessGoal !== undefined && { fitnessGoal: data.fitnessGoal }),
                ...(data.activityLevel !== undefined && { activityLevel: data.activityLevel }),
                ...(data.dietaryPreference !== undefined && { dietaryPreference: data.dietaryPreference }),
            },
        });

        return {
            id: profile.id,
            userId: profile.userId,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender as never,
            heightCm: profile.heightCm ? Number(profile.heightCm) : null,
            currentWeightKg: profile.currentWeightKg ? Number(profile.currentWeightKg) : null,
            targetWeightKg: profile.targetWeightKg ? Number(profile.targetWeightKg) : null,
            fitnessGoal: profile.fitnessGoal as never,
            activityLevel: profile.activityLevel as never,
            dietaryPreference: profile.dietaryPreference as never,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }

    /**
     * Update user password
     * @param userId - User ID
     * @param newPasswordHash - New hashed password
     * @returns Updated user (without password)
     */
    async updatePassword(userId: string, newPasswordHash: string): Promise<User | null> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
                passwordHash: false,
            },
        });

        return user;
    }
}
