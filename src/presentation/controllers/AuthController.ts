import { Request, Response, NextFunction } from 'express';
import { IRegisterUser } from '../../domain/interfaces/use-cases/IRegisterUser';
import { IAuthenticateUser } from '../../domain/interfaces/use-cases/IAuthenticateUser';
import { IChangePassword } from '../../domain/interfaces/use-cases/IChangePassword';
import { successResponse } from '../../shared/utils/response';
import { setAuthCookie, clearAuthCookie } from '../../shared/utils/cookie';
import { RegisterInput, LoginInput, ChangePasswordInput } from '../validators/authValidators';
import { NotFoundError } from '../../shared/errors/NotFoundError';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
export class AuthController {
    constructor(
        private registerUserUseCase: IRegisterUser,
        private authenticateUserUseCase: IAuthenticateUser,
        private changePasswordUseCase: IChangePassword
    ) { }

    /**
     * Register a new user
     * POST /api/auth/register
     */
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const input = req.body as RegisterInput;

            // Execute registration use case
            const user = await this.registerUserUseCase.execute(input);

            // Generate token for auto-login
            const { token } = await this.authenticateUserUseCase.execute({
                email: input.email,
                password: input.password,
            });

            // Set authentication cookie
            setAuthCookie(res, token);

            // Return success response
            successResponse(res, { user, token }, 201);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Login user
     * POST /api/auth/login
     */
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const input = req.body as LoginInput;

            // Execute authentication use case
            const { user, token } = await this.authenticateUserUseCase.execute(input);

            // Set authentication cookie
            setAuthCookie(res, token);

            // Return success response
            successResponse(res, { user, token });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Logout user
     * POST /api/auth/logout
     */
    logout = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        try {
            // Clear authentication cookie
            clearAuthCookie(res);

            // Return success response
            successResponse(res, { message: 'Logged out successfully' });
        } catch (error) {
            _next(error);
        }
    };

    /**
     * Verify authentication status
     * GET /api/auth/verify
     */
    verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // User is already attached by authMiddleware
            const user = req.user;

            // Return success response
            successResponse(res, {
                authenticated: true,
                user: {
                    id: user?.userId,
                    email: user?.email,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Change password
     * POST /api/auth/change-password
     */
    changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new NotFoundError('User not found');
            }

            const input = req.body as ChangePasswordInput;

            // Execute change password use case
            const result = await this.changePasswordUseCase.execute(userId, input);

            // Return success response
            successResponse(res, result);
        } catch (error) {
            next(error);
        }
    };
}
