import {
    IAuthenticateUser,
    AuthenticateUserInput,
    AuthenticateUserOutput,
} from '../../domain/interfaces/use-cases/IAuthenticateUser';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { comparePassword } from '../../shared/utils/password';
import { generateToken } from '../../shared/utils/jwt';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { logger } from '../../config/logger';

/**
 * User Repository with password access (extends the base interface)
 */
interface IUserRepositoryWithPassword extends IUserRepository {
    findByEmailWithPassword(email: string): Promise<
        | ({
            id: string;
            email: string;
            fullName: string;
            passwordHash: string;
        } & Record<string, unknown>)
        | null
    >;
}

/**
 * Authenticate User Use Case
 * Handles user login business logic
 */
export class AuthenticateUser implements IAuthenticateUser {
    constructor(private userRepository: IUserRepositoryWithPassword) { }

    /**
     * Execute user authentication
     * @param input - Login credentials
     * @returns User and JWT token
     */
    async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
        const { email, password } = input;

        // Find user with password hash
        const user = await this.userRepository.findByEmailWithPassword(email);
        if (!user) {
            logger.warn(`Login failed: User not found - ${email}`);
            throw new UnauthorizedError('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password - ${email}`);
            throw new UnauthorizedError('Invalid credentials');
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        logger.info(`User authenticated successfully: ${user.id} - ${user.email}`);

        // Return user without password hash
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt as Date,
                updatedAt: user.updatedAt as Date,
            },
            token,
        };
    }
}
