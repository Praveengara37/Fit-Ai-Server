# FitAI Backend API Documentation

Base URL for Mobile/Local Testing: `http://<YOUR_LOCAL_IP>:5000` (Update with your backend's IP address)

## Global Response Format
All API endpoints return responses in the following standard formats:

**Success Response (200 OK / 201 Created):**
```json
{
  "success": true,
  "data": { ... } // Response payload
}
```

**Error Response (400, 401, 404, 500, etc.):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // Optional error validation details
  }
}
```

## Authentication

Mobile apps must include the JWT token in the `Authorization` header for all protected routes:
```http
Authorization: Bearer <your_jwt_token_here>
```

---

### 1. Register User
**Endpoint:** `POST /api/auth/register`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com", // string, valid email format, max 255 chars
  "password": "Password123!", // string, min 8 chars, 1 uppercase, 1 lowercase, 1 number
  "fullName": "John Doe" // string, min 2 chars, max 255 chars
}
```

**Response Data (`data` field):**
Returns the newly created user object, the JWT token, and any other auth metadata based on the backend implementation.

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com", // string, valid email format
  "password": "Password123!" // string, required
}
```

**Response Data (`data` field):**
Returns the user profile and the JWT `token`, which you must store in `AsyncStorage`/`secure-store` locally and pass in the Authorization header for subsequent requests.

---

### 3. Logout User
**Endpoint:** `POST /api/auth/logout`
**Auth Required:** Yes 

**Request Body:** none

---

### 4. Verify Authentication Status
**Endpoint:** `GET /api/auth/verify`
**Auth Required:** Yes (via `Authorization: Bearer <token>`)

Used to verify on app launch if the current stored token is valid.

**Response Data (`data` field):**
Returns `{ isAuthenticated: true, user: { ... } }` or similar validation payload.

---

### 5. Change Password
**Endpoint:** `POST /api/auth/change-password`
**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!", // string, required
  "newPassword": "NewPassword123!", // string, min 8 chars, 1 upper, 1 lower, 1 number
  "confirmPassword": "NewPassword123!" // string, must match newPassword
}
```

---

## Profile Management

### 1. Setup Profile
**Endpoint:** `POST /api/profile/setup`
**Auth Required:** Yes

**Request Body:**
```json
{
  "fitnessGoal": "lose_weight", // Enum: lose_weight | gain_muscle | maintain | get_fit
  "activityLevel": "moderate",  // Enum: sedentary | light | moderate | active | very_active
  "dateOfBirth": "1995-10-15T00:00:00.000Z", // string (ISO Date), optional
  "gender": "male", // Enum: male | female | other | prefer_not_to_say, optional
  "heightCm": 178, // number, between 50 and 300, optional
  "currentWeightKg": 80, // number, between 20 and 500, optional
  "targetWeightKg": 75, // number, between 20 and 500, optional
  "dietaryPreference": "none" // Enum: none | vegetarian | vegan | keto | paleo | halal, optional
}
```

---

### 2. Update Profile
**Endpoint:** `PATCH /api/profile/update`
**Auth Required:** Yes

**Request Body:**
Same as **Setup Profile**, but *all* fields are optional. At least one field must be provided to perform an update.

---

### 3. Get User Profile
**Endpoint:** `GET /api/profile/me`
**Auth Required:** Yes

**Response Data (`data` field):**
Returns the consolidated complete user and profile details.

---

## Step Tracking

### 1. Log Steps
**Endpoint:** `POST /api/steps/log`
**Auth Required:** Yes

**Request Body:**
```json
{
  "date": "2023-10-25", // string (YYYY-MM-DD), required
  "steps": 10000,       // number, minimum 0
  "distanceKm": 7.5,    // number, minimum 0 (optional)
  "caloriesBurned": 400 // number, minimum 0 (optional)
}
```

---

### 2. Get Today's Steps
**Endpoint:** `GET /api/steps/today`
**Auth Required:** Yes

**Response Data (`data` field):**
```json
{
  "steps": {
     "date": "2023-10-25T00:00:00.000Z",
     "steps": 10000,
     "distanceKm": 7.5,
     "caloriesBurned": 400
  },
  "goalProgress": {
     "goal": 10000,
     "current": 10000,
     "percentage": 100,
     "achieved": true
  }
}
```

---

### 3. Get Step History
**Endpoint:** `GET /api/steps/history`
**Auth Required:** Yes

**Query Parameters:**
- `startDate` (optional, YYYY-MM-DD, defaults to 7 days ago)
- `endDate` (optional, YYYY-MM-DD, defaults to today)

**Response Data (`data` field):**
```json
{
  "history": [
    // Array of step objects for each day in range. Days without logs return 0 steps.
  ]
}
```

---

### 4. Get Step Stats
**Endpoint:** `GET /api/steps/stats`
**Auth Required:** Yes

**Query Parameters:**
- `period`: `week` | `month` | `year` (required)

**Response Data (`data` field):**
```json
{
  "period": "week",
  "stats": {
      "totalSteps": 50000,
      "averageSteps": 7142,
      "totalDistanceKm": 35.5,
      "totalCalories": 2000,
      "bestDay": {
          "date": "2023-10-24",
          "steps": 15000
      },
      "currentStreak": 5,
      "daysWithActivity": 6,
      "goalReachedDays": 4
  }
}
```

---

### 5. Update Step Entry
**Endpoint:** `PATCH /api/steps/:id`
**Auth Required:** Yes

**Request Body:**
```json
{
  "steps": 12000,       // number, minimum 0 (optional)
  "distanceKm": 9.0,    // number, minimum 0 (optional)
  "caloriesBurned": 450 // number, minimum 0 (optional)
}
```

---

### 6. Delete Step Entry
**Endpoint:** `DELETE /api/steps/:id`
**Auth Required:** Yes

**Response Data (`data` field):**
```json
{
  "message": "Steps record deleted successfully"
}
```
