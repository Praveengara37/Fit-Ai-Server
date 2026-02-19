# FitAI Backend - Update Profile & Change Password Testing

Complete Postman testing guide for the two new features.

---

## 🔧 Prerequisites

1. Server running: `npm run dev`
2. User logged in (cookie saved from register/login)
3. Profile created (for update profile endpoint)

---

## 1️⃣ Update Profile

**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/profile/update`  
**Auth:** Required (cookie)

### Request Body (All Optional):

```json
{
  "heightCm": 180.0,
  "currentWeightKg": 78.5,
  "fitnessGoal": "gain_muscle"
}
```

### All Field Options:

```json
{
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "heightCm": 180.0,
  "currentWeightKg": 78.5,
  "targetWeightKg": 75.0,
  "fitnessGoal": "gain_muscle",
  "activityLevel": "active",
  "dietaryPreference": "vegetarian"
}
```

**Enum Values:**
- gender: `"male"`, `"female"`, `"other"`, `"prefer_not_to_say"`, `null`
- fitnessGoal: `"lose_weight"`, `"gain_muscle"`, `"maintain"`, `"get_fit"`
- activityLevel: `"sedentary"`, `"light"`, `"moderate"`, `"active"`, `"very_active"`
- dietaryPreference: `"none"`, `"vegetarian"`, `"vegan"`, `"keto"`, `"paleo"`, `"halal"`, `null`

### Success Response (200):

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "userId": "uuid",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "heightCm": 180,
      "currentWeightKg": 78.5,
      "targetWeightKg": 75,
      "fitnessGoal": "gain_muscle",
      "activityLevel": "active",
      "dietaryPreference": "vegetarian",
      "createdAt": "2026-02-15T...",
      "updatedAt": "2026-02-15T..."
    }
  }
}
```

### Error Cases to Test:

**No fields provided:**
```json
{}
```
Expected: 400 - "At least one field must be provided for update"

**Profile doesn't exist:**
- Create new user, don't setup profile, try to update
- Expected: 404 - "Profile not found. Please create a profile first."

**Age validation (under 13):**
```json
{
  "dateOfBirth": "2020-01-01"
}
```
Expected: 400 - "User must be at least 13 years old"

**Invalid enum value:**
```json
{
  "fitnessGoal": "invalid_goal"
}
```
Expected: 400 - Validation error

**No authentication:**
- Clear cookies, try to update
- Expected: 401 - "Authentication required"

---

## 2️⃣ Change Password

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/change-password`  
**Auth:** Required (cookie)

### Request Body:

```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

### Success Response (200):

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

### Error Cases to Test:

**Wrong current password:**
```json
{
  "currentPassword": "WrongPassword",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```
Expected: 401 - "Current password is incorrect"

**Passwords don't match:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "DifferentPass789"
}
```
Expected: 400 - "Passwords do not match"

**New password same as current:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```
Expected: 400 - "New password must be different from current password"

**Weak new password:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "weak",
  "confirmPassword": "weak"
}
```
Expected: 400 - Validation errors (min 8 chars, uppercase, lowercase, number)

**No authentication:**
- Clear cookies, try to change password
- Expected: 401 - "Authentication required"

---

## 🧪 Complete Test Flow

### Scenario 1: Update Profile Successfully

1. **Login** (save cookie)
2. **Get Profile** - Note current values
3. **Update Profile** - Change 2-3 fields
4. **Get Profile** - Verify changes applied
5. **Update Profile Again** - Change different fields
6. **Get Profile** - Verify all changes

### Scenario 2: Change Password Successfully

1. **Login** with old password (save cookie)
2. **Change Password** - Use correct current password
3. **Logout**
4. **Login with OLD password** - Should fail (401)
5. **Login with NEW password** - Should succeed
6. **Verify Auth** - Should work with new session

### Scenario 3: Error Handling

1. **Update without login** - 401
2. **Update with no fields** - 400
3. **Update non-existent profile** - 404
4. **Change password with wrong current** - 401
5. **Change password with mismatched confirm** - 400

---

## 📊 Postman Collection JSON

```json
{
  "info": {
    "name": "FitAI - Update Profile & Change Password",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Update Profile",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"heightCm\": 180.0,\n  \"currentWeightKg\": 78.5,\n  \"fitnessGoal\": \"gain_muscle\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/profile/update",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "profile", "update"]
        }
      }
    },
    {
      "name": "Change Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"currentPassword\": \"SecurePass123\",\n  \"newPassword\": \"NewSecurePass456\",\n  \"confirmPassword\": \"NewSecurePass456\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/change-password",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "change-password"]
        }
      }
    }
  ]
}
```

---

## ✅ Success Checklist

- [ ] Update profile with single field
- [ ] Update profile with multiple fields
- [ ] Update profile validates age (13+)
- [ ] Update profile returns 404 if no profile exists
- [ ] Update profile returns 400 if no fields provided
- [ ] Change password with correct current password
- [ ] Change password validates new password complexity
- [ ] Change password checks passwords match
- [ ] Change password prevents reusing current password
- [ ] Change password returns 401 for wrong current password
- [ ] Both endpoints require authentication (401 without cookie)
- [ ] Can login with new password after change
- [ ] Cannot login with old password after change

---

**Happy Testing! 🚀**
