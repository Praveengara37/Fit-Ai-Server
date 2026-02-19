import { User } from '../../entities/User';

/**
 * Authenticate User use case input
 */
export interface AuthenticateUserInput {
    email: string;
    password: string;
}

/**
 * Authenticate User use case output
 */
export interface AuthenticateUserOutput {
    user: User;
    token: string;
}

/**
 * Authenticate User use case interface
 */
export interface IAuthenticateUser {
    /**
     * Execute user authentication
     * @param input - Login credentials
     * @returns User and JWT token
     */
    execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput>;
}
