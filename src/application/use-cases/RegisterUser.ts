import { IRegisterUser, RegisterUserInput } from '../../domain/interfaces/use-cases/IRegisterUser';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { hashPassword } from '../../shared/utils/password';
import { BadRequestError } from '../../shared/errors/BadRequestError';
import { logger } from '../../config/logger';

/**
 * Register User Use Case
 * Handles user registration business logic
 */
export class RegisterUser implements IRegisterUser {
    constructor(private userRepository: IUserRepository) { }

    /**
     * Execute user registration
     * @param input - Registration data
     * @returns Created user (without password)
     */
    async execute(input: RegisterUserInput): Promise<User> {
        const { email, password, fullName } = input;

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            logger.warn(`Registration failed: Email already exists - ${email}`);
            throw new BadRequestError('Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await this.userRepository.create({
            email,
            passwordHash,
            fullName,
        });

        logger.info(`User registered successfully: ${user.id} - ${user.email}`);

        return user;
    }
}
