/**
 * User Profile entity - Domain model
 */
export interface UserProfile {
    id: string;
    userId: string;
    dateOfBirth: Date | null;
    gender: Gender | null;
    heightCm: number | null;
    currentWeightKg: number | null;
    targetWeightKg: number | null;
    fitnessGoal: FitnessGoal;
    activityLevel: ActivityLevel;
    dietaryPreference: DietaryPreference | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Enums matching Prisma schema
 */
export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum FitnessGoal {
    LOSE_WEIGHT = 'lose_weight',
    GAIN_MUSCLE = 'gain_muscle',
    MAINTAIN = 'maintain',
    GET_FIT = 'get_fit',
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHT = 'light',
    MODERATE = 'moderate',
    ACTIVE = 'active',
    VERY_ACTIVE = 'very_active',
}

export enum DietaryPreference {
    NONE = 'none',
    VEGETARIAN = 'vegetarian',
    VEGAN = 'vegan',
    KETO = 'keto',
    PALEO = 'paleo',
    HALAL = 'halal',
}

/**
 * User profile data for creation
 */
export interface CreateUserProfileData {
    userId: string;
    dateOfBirth?: Date;
    gender?: Gender;
    heightCm?: number;
    currentWeightKg?: number;
    targetWeightKg?: number;
    fitnessGoal: FitnessGoal;
    activityLevel: ActivityLevel;
    dietaryPreference?: DietaryPreference;
}
