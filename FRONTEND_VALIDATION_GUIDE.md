# 📋 FitAI Backend - Frontend Validation Guide

Complete validation rules for all API endpoints to implement in your frontend.

---

## 🔐 Authentication Endpoints

### 1. Register - POST `/api/auth/register`

```typescript
{
  email: string;        // Required, valid email format, max 255 chars
  password: string;     // Required, min 8 chars, must contain:
                        //   - At least 1 uppercase letter
                        //   - At least 1 lowercase letter
                        //   - At least 1 number
  fullName: string;     // Required, min 2 chars, max 255 chars
}
```

**Validation Rules:**
- ✅ `email`: Valid email format, max 255 characters
- ✅ `password`: 
  - Minimum 8 characters
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
- ✅ `fullName`: Minimum 2 characters, max 255 characters

**Example:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

---

### 2. Login - POST `/api/auth/login`

```typescript
{
  email: string;        // Required, valid email format
  password: string;     // Required, min 1 char
}
```

**Validation Rules:**
- ✅ `email`: Valid email format
- ✅ `password`: Required (min 1 character)

**Example:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

---

### 3. Change Password - POST `/api/auth/change-password`

**Auth Required:** ✅ Yes (cookie)

```typescript
{
  currentPassword: string;    // Required, min 1 char
  newPassword: string;        // Required, min 8 chars, must contain:
                              //   - At least 1 uppercase letter
                              //   - At least 1 lowercase letter
                              //   - At least 1 number
  confirmPassword: string;    // Required, must match newPassword
}
```

**Validation Rules:**
- ✅ `currentPassword`: Required (min 1 character)
- ✅ `newPassword`: 
  - Minimum 8 characters
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - Must be different from `currentPassword`
- ✅ `confirmPassword`: Must match `newPassword` exactly

**Example:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

---

## 👤 Profile Endpoints

### 4. Setup Profile - POST `/api/profile/setup`

**Auth Required:** ✅ Yes (cookie)

```typescript
{
  // REQUIRED FIELDS
  fitnessGoal: "lose_weight" | "gain_muscle" | "maintain" | "get_fit";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  
  // OPTIONAL FIELDS
  dateOfBirth?: string;                    // ISO date string (YYYY-MM-DD)
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  heightCm?: number;                       // 50-300
  currentWeightKg?: number;                // 20-500
  targetWeightKg?: number;                 // 20-500
  dietaryPreference?: "none" | "vegetarian" | "vegan" | "keto" | "paleo" | "halal";
}
```

**Validation Rules:**

#### Required Fields:
- ✅ `fitnessGoal`: **REQUIRED** - Must be one of:
  - `"lose_weight"`
  - `"gain_muscle"`
  - `"maintain"`
  - `"get_fit"`

- ✅ `activityLevel`: **REQUIRED** - Must be one of:
  - `"sedentary"`
  - `"light"`
  - `"moderate"`
  - `"active"`
  - `"very_active"`

#### Optional Fields:
- ✅ `dateOfBirth`: Optional, ISO date string (e.g., `"1990-01-15"`)
  - User must be 13+ years old

- ✅ `gender`: Optional, must be one of:
  - `"male"`
  - `"female"`
  - `"other"`
  - `"prefer_not_to_say"`

- ✅ `heightCm`: Optional, number
  - Minimum: 50
  - Maximum: 300

- ✅ `currentWeightKg`: Optional, number
  - Minimum: 20
  - Maximum: 500

- ✅ `targetWeightKg`: Optional, number
  - Minimum: 20
  - Maximum: 500

- ✅ `dietaryPreference`: Optional, must be one of:
  - `"none"`
  - `"vegetarian"`
  - `"vegan"`
  - `"keto"`
  - `"paleo"`
  - `"halal"`

**Minimal Example:**
```json
{
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate"
}
```

**Complete Example:**
```json
{
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "heightCm": 175,
  "currentWeightKg": 80,
  "targetWeightKg": 70,
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate",
  "dietaryPreference": "vegetarian"
}
```

---

### 5. Update Profile - PATCH `/api/profile/update`

**Auth Required:** ✅ Yes (cookie)

```typescript
{
  // ALL FIELDS ARE OPTIONAL
  // But at least ONE field must be provided
  
  dateOfBirth?: string;                    // ISO date string (YYYY-MM-DD)
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  heightCm?: number;                       // 50-300
  currentWeightKg?: number;                // 20-500
  targetWeightKg?: number;                 // 20-500
  fitnessGoal?: "lose_weight" | "gain_muscle" | "maintain" | "get_fit";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  dietaryPreference?: "none" | "vegetarian" | "vegan" | "keto" | "paleo" | "halal" | null;
}
```

**Validation Rules:**

- ✅ **At least ONE field must be provided**

- ✅ `dateOfBirth`: Optional, ISO date string
  - User must be 13+ years old

- ✅ `gender`: Optional, can be `null`, must be one of:
  - `"male"`, `"female"`, `"other"`, `"prefer_not_to_say"`, `null`

- ✅ `heightCm`: Optional, number (50-300)

- ✅ `currentWeightKg`: Optional, number (20-500)

- ✅ `targetWeightKg`: Optional, number (20-500)

- ✅ `fitnessGoal`: Optional, must be one of:
  - `"lose_weight"`, `"gain_muscle"`, `"maintain"`, `"get_fit"`

- ✅ `activityLevel`: Optional, must be one of:
  - `"sedentary"`, `"light"`, `"moderate"`, `"active"`, `"very_active"`

- ✅ `dietaryPreference`: Optional, can be `null`, must be one of:
  - `"none"`, `"vegetarian"`, `"vegan"`, `"keto"`, `"paleo"`, `"halal"`, `null`

**Example (update only weight):**
```json
{
  "currentWeightKg": 78.5
}
```

**Example (update multiple fields):**
```json
{
  "heightCm": 180,
  "currentWeightKg": 78.5,
  "fitnessGoal": "gain_muscle"
}
```

---

## 🎨 Frontend Implementation Examples

### TypeScript Types:

```typescript
// Enums
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type FitnessGoal = "lose_weight" | "gain_muscle" | "maintain" | "get_fit";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type DietaryPreference = "none" | "vegetarian" | "vegan" | "keto" | "paleo" | "halal";

// Register
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

// Change Password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Setup Profile
export interface SetupProfileRequest {
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dateOfBirth?: string;
  gender?: Gender;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  dietaryPreference?: DietaryPreference;
}

// Update Profile
export interface UpdateProfileRequest {
  dateOfBirth?: string;
  gender?: Gender | null;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  fitnessGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietaryPreference?: DietaryPreference | null;
}
```

---

### React Hook Form + Zod Example:

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Setup Profile Schema
const setupProfileSchema = z.object({
  fitnessGoal: z.enum(['lose_weight', 'gain_muscle', 'maintain', 'get_fit']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  heightCm: z.number().min(50).max(300).optional(),
  currentWeightKg: z.number().min(20).max(500).optional(),
  targetWeightKg: z.number().min(20).max(500).optional(),
  dietaryPreference: z.enum(['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'halal']).optional(),
});

// Usage
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(setupProfileSchema)
});
```

---

### Validation Helper Functions:

```typescript
// Password validation
export const validatePassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  
  return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
};

// Age validation (13+)
export const validateAge = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (age > 13) return true;
  if (age === 13 && monthDiff >= 0) return true;
  return false;
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};
```

---

## 🚨 Common Validation Errors

### 400 Bad Request Errors:

**Setup Profile:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "fitnessGoal is required"
  }
}
```

**Change Password:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Passwords do not match"
  }
}
```

**Update Profile:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one field must be provided for update"
  }
}
```

---

## 📝 Quick Reference Table

| Field | Setup Profile | Update Profile | Type | Range/Options |
|-------|--------------|----------------|------|---------------|
| `fitnessGoal` | **Required** | Optional | Enum | `lose_weight`, `gain_muscle`, `maintain`, `get_fit` |
| `activityLevel` | **Required** | Optional | Enum | `sedentary`, `light`, `moderate`, `active`, `very_active` |
| `dateOfBirth` | Optional | Optional | String | ISO date, 13+ years |
| `gender` | Optional | Optional/Null | Enum | `male`, `female`, `other`, `prefer_not_to_say` |
| `heightCm` | Optional | Optional | Number | 50-300 |
| `currentWeightKg` | Optional | Optional | Number | 20-500 |
| `targetWeightKg` | Optional | Optional | Number | 20-500 |
| `dietaryPreference` | Optional | Optional/Null | Enum | `none`, `vegetarian`, `vegan`, `keto`, `paleo`, `halal` |

---

## 🔒 Important Notes

1. **All authenticated endpoints require `credentials: 'include'`** in fetch
2. **Cookies are HTTP-only** - don't try to access them from JavaScript
3. **CORS is configured** for `localhost:3000, 3001, 3002, 5173, 5174`
4. **Backend validates everything** - frontend validation is for UX only
5. **Error responses** always have format: `{ success: false, error: { code, message } }`

---

**Questions?** Check the [CORS_FIX_GUIDE.md](./CORS_FIX_GUIDE.md) and [NEW_FEATURES_TESTING_GUIDE.md](./NEW_FEATURES_TESTING_GUIDE.md)
