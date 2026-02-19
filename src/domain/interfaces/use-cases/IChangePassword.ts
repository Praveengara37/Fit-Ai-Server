/**
 * Input data for changing user password
 */
export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Output data for successful password change
 */
export interface ChangePasswordOutput {
    message: string;
}

/**
 * Change Password Use Case Interface
 * Allows authenticated users to change their password
 */
export interface IChangePassword {
    /**
     * Execute the change password use case
     * @param userId - ID of the authenticated user
     * @param input - Current and new password data
     * @returns Success message
     * @throws BadRequestError if validation fails or passwords don't match
     * @throws UnauthorizedError if current password is incorrect
     */
    execute(userId: string, input: ChangePasswordInput): Promise<ChangePasswordOutput>;
}
