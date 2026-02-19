import { IChangePassword, ChangePasswordInput, ChangePasswordOutput } from '../../domain/interfaces/use-cases/IChangePassword';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { BadRequestError } from '../../shared/errors/BadRequestError';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { logger } from '../../config/logger';

/**
 * Change Password Use Case
 * Allows authenticated users to change their password
 */
export class ChangePassword implements IChangePassword {
    constructor(private userRepository: IUserRepository) { }

    /**
     * Execute change password use case
     */
    async execute(userId: string, input: ChangePasswordInput): Promise<ChangePasswordOutput> {
        // Get user with password hash
        const user = await this.userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(input.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        // Check if new password is different from current
        const isSamePassword = await comparePassword(input.newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new BadRequestError('New password must be different from current password');
        }

        // Hash new password
        const newPasswordHash = await hashPassword(input.newPassword);

        // Update password
        await this.userRepository.updatePassword(userId, newPasswordHash);

        logger.info(`Password changed for user: ${userId}`);

        return {
            message: 'Password changed successfully',
        };
    }
}
