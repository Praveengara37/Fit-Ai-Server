import { z } from 'zod';

/**
 * Gender enum values
 */
const genderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

/**
 * Fitness goal enum values
 */
const fitnessGoalEnum = z.enum(['lose_weight', 'gain_muscle', 'maintain', 'get_fit']);

/**
 * Activity level enum values
 */
const activityLevelEnum = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']);

/**
 * Dietary preference enum values
 */
const dietaryPreferenceEnum = z.enum(['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'halal']);

/**
 * Setup profile validation schema
 */
export const setupProfileSchema = z.object({
    dateOfBirth: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    gender: genderEnum.optional(),
    heightCm: z
        .number()
        .min(50, 'Height must be at least 50 cm')
        .max(300, 'Height must be less than 300 cm')
        .optional(),
    currentWeightKg: z
        .number()
        .min(20, 'Weight must be at least 20 kg')
        .max(500, 'Weight must be less than 500 kg')
        .optional(),
    targetWeightKg: z
        .number()
        .min(20, 'Target weight must be at least 20 kg')
        .max(500, 'Target weight must be less than 500 kg')
        .optional(),
    fitnessGoal: fitnessGoalEnum,
    activityLevel: activityLevelEnum,
    dietaryPreference: dietaryPreferenceEnum.optional(),
});

export type SetupProfileInput = z.infer<typeof setupProfileSchema>;

/**
 * Update profile validation schema
 * All fields are optional, but at least one must be provided
 */
export const updateProfileSchema = z
    .object({
        dateOfBirth: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        gender: genderEnum.nullable().optional(),
        heightCm: z
            .number()
            .min(50, 'Height must be at least 50 cm')
            .max(300, 'Height must be less than 300 cm')
            .optional(),
        currentWeightKg: z
            .number()
            .min(20, 'Weight must be at least 20 kg')
            .max(500, 'Weight must be less than 500 kg')
            .optional(),
        targetWeightKg: z
            .number()
            .min(20, 'Target weight must be at least 20 kg')
            .max(500, 'Target weight must be less than 500 kg')
            .optional(),
        fitnessGoal: fitnessGoalEnum.optional(),
        activityLevel: activityLevelEnum.optional(),
        dietaryPreference: dietaryPreferenceEnum.nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
