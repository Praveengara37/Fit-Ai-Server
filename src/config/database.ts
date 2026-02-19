import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

/**
 * Prisma Client singleton instance
 * Ensures only one database connection is created
 */
class Database {
    private static instance: PrismaClient;

    private constructor() { }

    /**
     * Get Prisma Client instance
     */
    public static getInstance(): PrismaClient {
        if (!Database.instance) {
            Database.instance = new PrismaClient({
                log: [
                    { level: 'query', emit: 'event' },
                    { level: 'error', emit: 'event' },
                    { level: 'warn', emit: 'event' },
                ],
            });

            // Log database queries in development
            Database.instance.$on('query' as never, (e: unknown) => {
                const event = e as { query: string; duration: number };
                logger.debug(`Query: ${event.query} - Duration: ${event.duration}ms`);
            });

            // Log database errors
            Database.instance.$on('error' as never, (e: unknown) => {
                const event = e as { message: string };
                logger.error(`Database Error: ${event.message}`);
            });

            // Log database warnings
            Database.instance.$on('warn' as never, (e: unknown) => {
                const event = e as { message: string };
                logger.warn(`Database Warning: ${event.message}`);
            });

            logger.info('✅ Database connection established');
        }

        return Database.instance;
    }

    /**
     * Gracefully disconnect from database
     */
    public static async disconnect(): Promise<void> {
        if (Database.instance) {
            await Database.instance.$disconnect();
            logger.info('Database connection closed');
        }
    }
}

export const prisma = Database.getInstance();
export const disconnectDatabase = Database.disconnect;
