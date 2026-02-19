import { z } from 'zod';

/**
 * Registration validation schema
 */
export const registerSchema = z.object({
    email: z.string().email('Invalid email format').max(255, 'Email too long'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Change password validation schema
 */
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'New password must contain at least one number'),
        confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
