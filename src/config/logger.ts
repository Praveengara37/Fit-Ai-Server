import winston from 'winston';
import { config } from './env';

/**
 * Custom log format for console output
 */
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaString}`;
    })
);

/**
 * JSON format for file logging
 */
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Error log file
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
        }),
        // Combined log file
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
        }),
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false,
});

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
import { dirname } from 'path';

try {
    mkdirSync(dirname('logs/error.log'), { recursive: true });
} catch (error) {
    // Directory already exists
}

/**
 * Stream for Morgan HTTP logger integration
 */
export const loggerStream = {
    write: (message: string): void => {
        logger.info(message.trim());
    },
};
