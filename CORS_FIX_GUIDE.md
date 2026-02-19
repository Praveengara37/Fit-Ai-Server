# 🔧 CORS Error Fix Guide

## Problem
Getting CORS errors when connecting from frontend to FitAI backend.

---

## ✅ Backend Fix (Already Applied)

Updated `src/app.ts` to allow multiple origins for development.

**Allowed origins:**
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://localhost:5174`
- Plus your configured `FRONTEND_URL` from `.env`

---

## 🌐 Frontend Requirements

### CRITICAL: You MUST include credentials in ALL fetch requests!

### ❌ Wrong (Will NOT work with cookies):
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### ✅ Correct (Works with cookies):
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ← CRITICAL!
  body: JSON.stringify({ email, password })
})
```

---

## 📦 Frontend Examples

### Using Fetch API:
```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ← Required for cookies
  body: JSON.stringify({ email, password })
});

// Update Profile
const response = await fetch('http://localhost:3000/api/profile/update', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ← Required for cookies
  body: JSON.stringify({ heightCm: 180 })
});
```

### Using Axios:
```javascript
import axios from 'axios';

// Configure axios globally
axios.defaults.withCredentials = true;

// Or per request
axios.post('http://localhost:3000/api/auth/login', 
  { email, password },
  { withCredentials: true }
);
```

### Using React Query / TanStack Query:
```javascript
const { mutate } = useMutation({
  mutationFn: async (data) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // ← Required
      body: JSON.stringify(data)
    });
    return response.json();
  }
});
```

---

## 🔍 Debugging Steps

### 1. Check Browser Console
Look for specific CORS error message:
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header 
in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

### 2. Check Network Tab
- Open DevTools → Network
- Look at the failed request
- Check **Response Headers** for:
  - `Access-Control-Allow-Origin` (should be your frontend URL)
  - `Access-Control-Allow-Credentials` (should be `true`)

### 3. Verify Backend is Running
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 4. Test with Postman First
If Postman works but browser doesn't, it's definitely a CORS/credentials issue.

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Forgot `credentials: 'include'`
```javascript
// Missing credentials - cookies won't be sent!
fetch('http://localhost:3000/api/profile/me', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
```

### ❌ Mistake 2: Wrong backend URL
```javascript
// Wrong port or protocol
fetch('http://localhost:5000/api/...') // Backend is on 3000!
fetch('https://localhost:3000/api/...') // Should be http in dev!
```

### ❌ Mistake 3: Frontend URL not in allowed origins
If your frontend runs on `http://localhost:3002`, add it to `.env`:
```bash
FRONTEND_URL=http://localhost:3002
```

---

## 🎯 Quick Test

### Step 1: Login from Frontend
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123'
  })
});

const data = await response.json();
console.log(data); // Should see user data
```

### Step 2: Check Cookie was Set
- Open DevTools → Application → Cookies
- Look for `auth_token` cookie
- Should have:
  - **Domain:** `localhost`
  - **Path:** `/`
  - **HttpOnly:** ✓
  - **Secure:** (empty in development)
  - **SameSite:** `Lax`

### Step 3: Make Authenticated Request
```javascript
const response = await fetch('http://localhost:3000/api/profile/me', {
  method: 'GET',
  credentials: 'include'  // Cookie will be sent automatically
});

const data = await response.json();
console.log(data); // Should see profile data
```

---

## 📝 Production Checklist

When deploying to production:

1. ✅ Update `.env` with production frontend URL:
   ```bash
   FRONTEND_URL=https://yourdomain.com
   ```

2. ✅ Remove development origins from `app.ts`

3. ✅ Enable HTTPS (required for secure cookies)

4. ✅ Update cookie settings for production in `src/shared/utils/cookie.ts`:
   ```typescript
   secure: config.NODE_ENV === 'production',
   sameSite: 'strict',
   ```

---

## 🆘 Still Not Working?

**Tell me:**
1. What's your frontend URL? (e.g., `http://localhost:3001`)
2. What's the exact CORS error message?
3. Are you using `credentials: 'include'` in your fetch?
4. Can you see the cookie in DevTools after login?

I'll help you debug further!
