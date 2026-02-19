import { createApp } from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { disconnectDatabase } from './config/database';

/**
 * Start the Express server
 */
const startServer = async (): Promise<void> => {
    try {
        // Create app
        const app = createApp();

        // Start server
        const server = app.listen(config.PORT, () => {
            logger.info(`🚀 FitAI Backend Server started`);
            logger.info(`📍 Environment: ${config.NODE_ENV}`);
            logger.info(`🌐 Server running on port ${config.PORT}`);
            logger.info(`🔗 Health check: http://localhost:${config.PORT}/health`);
            logger.info(`🍪 Cookie-based authentication enabled`);
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal: string): Promise<void> => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                // Disconnect from database
                await disconnectDatabase();

                logger.info('Graceful shutdown completed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error: Error) => {
            logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
            gracefulShutdown('UNCAUGHT_EXCEPTION').catch(() => process.exit(1));
        });

        process.on('unhandledRejection', (reason: unknown) => {
            logger.error('Unhandled Rejection', { reason });
            gracefulShutdown('UNHANDLED_REJECTION').catch(() => process.exit(1));
        });
    } catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
};

// Start server
startServer().catch((error) => {
    logger.error('Server startup failed', { error });
    process.exit(1);
});
