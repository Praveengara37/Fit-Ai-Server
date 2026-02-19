import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration schema with validation
 */
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_EXPIRY: z.string().default('7d'),
    BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(1).max(20)).default('10'),
    COOKIE_NAME: z.string().default('auth_token'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

/**
 * Validated and type-safe environment configuration
 */
const parseEnv = (): z.infer<typeof envSchema> => {
    try {
        return envSchema.parse({
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            DATABASE_URL: process.env.DATABASE_URL,
            JWT_SECRET: process.env.JWT_SECRET,
            JWT_EXPIRY: process.env.JWT_EXPIRY,
            BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
            COOKIE_NAME: process.env.COOKIE_NAME,
            LOG_LEVEL: process.env.LOG_LEVEL,
            FRONTEND_URL: process.env.FRONTEND_URL,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:');
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};

export const config = parseEnv();
