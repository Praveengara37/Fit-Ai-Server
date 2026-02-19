import { User } from '../../entities/User';

/**
 * Register User use case input
 */
export interface RegisterUserInput {
    email: string;
    password: string;
    fullName: string;
}

/**
 * Register User use case interface
 */
export interface IRegisterUser {
    /**
     * Execute user registration
     * @param input - Registration data
     * @returns Created user
     */
    execute(input: RegisterUserInput): Promise<User>;
}
