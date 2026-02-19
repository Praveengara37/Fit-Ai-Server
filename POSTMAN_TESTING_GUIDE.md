# FitAI Backend - Postman Testing Guide

Complete guide for testing all 6 API endpoints in Postman with cookie-based authentication.

---

## 🔧 Postman Setup (IMPORTANT!)

### Enable Cookie Handling
Postman automatically handles cookies, but make sure:
1. **Settings** → **General** → **Cookies** is enabled
2. Cookies will be saved automatically after login/register
3. Cookies will be sent automatically with subsequent requests

---

## 📋 Test Endpoints in Order

### 1️⃣ Health Check

**Method:** `GET`  
**URL:** `http://localhost:3000/health`

**Headers:** None required

**Body:** None

**Expected Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T07:10:26.920Z"
}
```

---

### 2️⃣ Register User (Creates Cookie)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@fitai.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@fitai.com",
      "fullName": "John Doe",
      "createdAt": "2026-02-15T...",
      "updatedAt": "2026-02-15T..."
    }
  }
}
```

**✅ Check:** Cookie `auth_token` should be saved in Postman cookies (View → Show Cookies)

**Validation Rules:**
- Email: Valid email format, max 255 chars
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Full Name: Min 2 chars, max 255 chars

**Test Invalid Data:**
```json
{
  "email": "invalid-email",
  "password": "weak",
  "fullName": "A"
}
```
Expected: 400 Bad Request with validation errors

---

### 3️⃣ Login User (Creates Cookie)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@fitai.com",
  "password": "SecurePass123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@fitai.com",
      "fullName": "John Doe"
    }
  }
}
```

**✅ Check:** Cookie `auth_token` updated

**Test Invalid Credentials:**
```json
{
  "email": "john.doe@fitai.com",
  "password": "WrongPassword"
}
```
Expected: 401 Unauthorized

---

### 4️⃣ Verify Authentication (Uses Cookie)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/auth/verify`

**Headers:** None required (cookie sent automatically)

**Body:** None

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "uuid-here",
      "email": "john.doe@fitai.com"
    }
  }
}
```

**✅ Check:** Request uses cookie automatically

**Test Without Cookie:**
1. Clear cookies in Postman (Cookies → Remove)
2. Send request again
Expected: 401 Unauthorized

---

### 5️⃣ Setup Fitness Profile (Protected - Uses Cookie)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/profile/setup`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "heightCm": 175.5,
  "currentWeightKg": 80.0,
  "targetWeightKg": 75.0,
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate",
  "dietaryPreference": "none"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid-here",
      "userId": "uuid-here",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "heightCm": 175.5,
      "currentWeightKg": 80,
      "targetWeightKg": 75,
      "fitnessGoal": "lose_weight",
      "activityLevel": "moderate",
      "dietaryPreference": "none",
      "createdAt": "2026-02-15T...",
      "updatedAt": "2026-02-15T..."
    }
  }
}
```

**Field Options:**

**gender** (optional):
- `"male"`
- `"female"`
- `"other"`
- `"prefer_not_to_say"`

**fitnessGoal** (required):
- `"lose_weight"`
- `"gain_muscle"`
- `"maintain"`
- `"get_fit"`

**activityLevel** (required):
- `"sedentary"`
- `"light"`
- `"moderate"`
- `"active"`
- `"very_active"`

**dietaryPreference** (optional):
- `"none"`
- `"vegetarian"`
- `"vegan"`
- `"keto"`
- `"paleo"`
- `"halal"`

**Validation Rules:**
- dateOfBirth: User must be 13+ years old
- heightCm: 50-300 range
- currentWeightKg: 20-500 range
- targetWeightKg: 20-500 range

**Alternative Test Body (Minimal):**
```json
{
  "fitnessGoal": "get_fit",
  "activityLevel": "light"
}
```

**Test Age Validation (Should Fail):**
```json
{
  "dateOfBirth": "2020-01-01",
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate"
}
```
Expected: 400 Bad Request (User must be at least 13 years old)

---

### 6️⃣ Get User Profile (Protected - Uses Cookie)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/profile/me`

**Headers:** None required (cookie sent automatically)

**Body:** None

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@fitai.com",
      "fullName": "John Doe"
    },
    "profile": {
      "id": "uuid-here",
      "userId": "uuid-here",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "heightCm": 175.5,
      "currentWeightKg": 80,
      "targetWeightKg": 75,
      "fitnessGoal": "lose_weight",
      "activityLevel": "moderate",
      "dietaryPreference": "none",
      "createdAt": "2026-02-15T...",
      "updatedAt": "2026-02-15T..."
    }
  }
}
```

**If No Profile Created Yet:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "profile": null
  }
}
```

---

### 7️⃣ Logout (Clears Cookie)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/logout`

**Headers:** None required

**Body:** None

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**✅ Check:** Cookie `auth_token` should be cleared

**Verify Logout:**
After logout, try accessing `/api/auth/verify` again.  
Expected: 401 Unauthorized

---

## 🧪 Complete Test Flow

### Test Scenario 1: New User Registration Flow
1. **Register** → Cookie set
2. **Verify Auth** → Should work
3. **Setup Profile** → Profile created
4. **Get Profile** → Returns user + profile
5. **Logout** → Cookie cleared
6. **Verify Auth** → Should fail (401)

### Test Scenario 2: Existing User Login Flow
1. **Login** → Cookie set
2. **Verify Auth** → Should work
3. **Get Profile** → Returns existing data
4. **Logout** → Cookie cleared

### Test Scenario 3: Error Handling
1. **Register with invalid email** → 400 Bad Request
2. **Login with wrong password** → 401 Unauthorized
3. **Access protected route without cookie** → 401 Unauthorized
4. **Setup profile with age < 13** → 400 Bad Request
5. **Setup profile twice** → 400 Bad Request (profile already exists)

---

## 📊 Postman Collection JSON

You can import this collection directly into Postman:

```json
{
  "info": {
    "name": "FitAI Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Register User",
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
          "raw": "{\n  \"email\": \"john.doe@fitai.com\",\n  \"password\": \"SecurePass123\",\n  \"fullName\": \"John Doe\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Login",
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
          "raw": "{\n  \"email\": \"john.doe@fitai.com\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Verify Auth",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/auth/verify",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "verify"]
        }
      }
    },
    {
      "name": "Setup Profile",
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
          "raw": "{\n  \"dateOfBirth\": \"1990-01-15\",\n  \"gender\": \"male\",\n  \"heightCm\": 175.5,\n  \"currentWeightKg\": 80.0,\n  \"targetWeightKg\": 75.0,\n  \"fitnessGoal\": \"lose_weight\",\n  \"activityLevel\": \"moderate\",\n  \"dietaryPreference\": \"none\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/profile/setup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "profile", "setup"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/profile/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "profile", "me"]
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/auth/logout",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "logout"]
        }
      }
    }
  ]
}
```

**To Import:**
1. Open Postman
2. Click **Import** button
3. Paste the JSON above
4. Click **Import**

---

## 🔍 Viewing Cookies in Postman

1. Click **Cookies** (below the Send button)
2. Look for `localhost:3000`
3. You should see `auth_token` cookie after login/register
4. Cookie should disappear after logout

---

## ✅ Success Checklist

- [ ] Health check returns 200 OK
- [ ] Register creates user and sets cookie
- [ ] Login authenticates and sets cookie
- [ ] Verify auth works with cookie
- [ ] Setup profile creates fitness data
- [ ] Get profile returns user + profile
- [ ] Logout clears cookie
- [ ] Protected routes return 401 without cookie
- [ ] Validation errors return 400 with details

---

## 🐛 Troubleshooting

**Issue:** 401 Unauthorized on protected routes  
**Solution:** Make sure you've logged in/registered first. Check cookies are enabled in Postman.

**Issue:** Cookie not being saved  
**Solution:** Settings → General → Enable cookies. Also check that server is running on `http://localhost:3000`.

**Issue:** CORS errors  
**Solution:** Make sure `FRONTEND_URL` in `.env` matches your request origin (or use Postman which handles CORS).

---

**Happy Testing! 🚀**
