/**
 * User entity - Domain model
 * Pure business logic, no framework dependencies
 */
export interface User {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User data for creation (without generated fields)
 */
export interface CreateUserData {
    email: string;
    passwordHash: string;
    fullName: string;
}
