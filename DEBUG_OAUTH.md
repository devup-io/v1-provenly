# OAuth Flow Debugging Guide

## Current Issue
POST /api/v1/projects/import-all returns 401 Unauthorized despite cookie-based auth setup.

## What Changed
✅ Frontend now retries import-all 3 times with exponential backoff (500ms, 1000ms, 2000ms) to handle timing issues
✅ Import failures are non-blocking - users can still access dashboard/onboarding and manually import later
✅ Better error messages in console guide you to check cookies

## Checklist to Debug

### 1. Check Browser Cookies After OAuth
After completing OAuth flow:
- Open DevTools → Application → Cookies
- Filter by backend domain (e.g., localhost:8000)
- Look for cookie named `v1_access_token` or similar
- If MISSING: 🔴 **Backend OAuth callback not setting cookie**
  - Check backend /api/v1/auth/github/callback response headers
  - Should have: `Set-Cookie: v1_access_token=JWT;HttpOnly;Path=/;SameSite=Lax`
  - In development (http://): may need `Secure=false`
- If PRESENT: ✅ Continue to step 2

### 2. Check Cookie is Sent with Import Request
When frontend retries import-all:
- Open DevTools → Network tab
- Find any request to `import-all` (may be multiple due to retries)
- Click on request → Request Headers
- Look for: `Cookie: v1_access_token=...` (or similar cookie)
- If MISSING: 🔴 **Browser not sending cookie**
  - Possible causes:
    - Domain/path mismatch in Set-Cookie
    - Cookie SameSite policy blocking cross-origin
    - Incognito mode blocking cookies
  - Frontend has `credentials: "include"` ✅, so this is backend issue
- If PRESENT: ✅ Continue to step 3

### 3. Check CORS Headers in Response
Backend must allow credentials with CORS:
- DevTools → Network → import-all request → Response Headers
- Should show: `Access-Control-Allow-Credentials: true`
- Should show: `Access-Control-Allow-Origin: http://localhost:8080` (or your frontend URL)
- If missing: 🔴 **Backend CORS not configured for credentials**
  - Backend must set both headers for credentials to work with CORS

### 4. Check Console Logs
Open DevTools → Console and look for:
```
[API] POST /api/v1/projects/import-all?evaluate_ai=true
[API Response] Status: 401
  hasCredentials: true
  origin: http://localhost:8080

Import failed with 401, retrying in 500ms (attempt 1/3)
Import failed with 401, retrying in 1000ms (attempt 2/3)
...
Project import triggered successfully  (✅ if succeeds)
OR
Project import failed (non-blocking) (⚠️ if all retries exhausted)
```

## Common 401 Causes & Fixes

### 1. Cookie Not Set by Backend
**Symptom**: No `v1_access_token` cookie in DevTools
**Fix**: Backend OAuth callback needs to set:
```python
response.set_cookie(
    "v1_access_token",
    token_value,
    httponly=True,
    secure=False,  # Set to True in production HTTPS
    samesite="Lax",
    path="/",
    max_age=7*24*60*60  # 7 days
)
```

### 2. Cookie Not Sent by Browser
**Symptom**: Cookie exists but not in Request Headers
**Fix**: Backend must send CORS headers:
```python
response.headers["Access-Control-Allow-Credentials"] = "true"
response.headers["Access-Control-Allow-Origin"] = "http://localhost:8080"
```

### 3. Backend Not Validating Cookie
**Symptom**: Cookie sent but 401 still returned
**Fix**: Backend import endpoint must:
- Read cookie: `token = request.cookies.get("v1_access_token")`
- Validate JWT
- Extract user ID
- Check user has permissions

## Frontend Fixes Applied
✅ Retry import 3 times with exponential backoff (500ms, 1000ms, 2000ms)
✅ Filter out "undefined" string in oauth_state parameter  
✅ Filter out "undefined" string in validation
✅ Non-blocking import failures (users can still access dashboard)
✅ Better console logging with debugging guidance
✅ Debug page at /debug/auth to inspect cookies/state

## What Happens If Import Still Fails After Retries
- User is still logged in ✅
- User sees dashboard or onboarding ✅  
- Repos not auto-imported ⚠️
- User can click "Refresh Projects" button to manually trigger import later ✅

## Next Steps
1. **Immediately**: Check DevTools Cookies for `v1_access_token` after OAuth completes
2. **If missing**: Backend's OAuth callback (`/api/v1/auth/github/callback`) must set `Set-Cookie` header
3. **If present**: Check Response Headers on import-all request for `Access-Control-Allow-Credentials` header
4. **Check Console**: Look for detailed error message with instructions
5. **Check Backend Logs**: /api/v1/projects/import-all should log why authentication failed

