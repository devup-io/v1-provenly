# Backend OAuth Callback Fix Required

## Current Status

✅ **Working**:
- GitHub OAuth token exchange
- User authentication
- Cookie setting (`v1_access_token`)
- Repository import (POST /api/v1/projects/import-all returns 200 OK)

❌ **Broken**:
- Backend OAuth callback redirect to frontend

## The Problem

Your backend OAuth callback handler at `/api/v1/auth/github/callback` is:
1. Successfully authenticating users ✅
2. Setting the session cookie ✅
3. **NOT redirecting to the frontend with developer data** ❌

Instead, it should redirect the browser to:
```
http://localhost:8080/auth/callback?data=<BASE64_ENCODED_DEVELOPER>&state=<OAUTH_STATE>
```

## Required Backend Fix

### Location
`app/routes/v1_auth_routes.py` - GitHub callback endpoint

### Current (Broken) Code Pattern
```python
@router.get("/github/callback")
async def github_callback(code: str, state: str, ...):
    # ... OAuth token exchange ...
    # ... Create/update developer ...
    # ... Create JWT token ...
    
    # ❌ Missing redirect to frontend
    response = JSONResponse({"message": "Success"})
    response.set_cookie("v1_access_token", token, ...)
    return response
```

### Required (Working) Code Pattern
```python
import base64
import json
from fastapi.responses import RedirectResponse
from urllib.parse import quote

@router.get("/github/callback")
async def github_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    try:
        # 1. Exchange code for GitHub token
        # ... your existing token exchange logic ...
        
        # 2. Get GitHub user info
        # ... your existing user fetch logic ...
        
        # 3. Create or update developer in database
        # ... your existing developer creation logic ...
        developer = get_or_create_developer(...)  # Your existing logic
        
        # 4. Create JWT token
        access_token = create_access_token(
            data={"sub": developer.github_username, "id": str(developer.id)}
        )
        
        # 5. Prepare developer data for frontend
        developer_data = {
            "developer": {
                "id": str(developer.id),
                "github_username": developer.github_username,
                "name": developer.name or developer.github_username,  # Fallback to username if name not set
                "email": developer.email,
                "avatar_url": developer.avatar_url,
                "bio": developer.bio or "",
                "location": developer.location or "",
                "website": developer.website or "",
                "tech_stack": developer.tech_stack or [],
                "role": developer.role or "",
                "profile_complete": developer.profile_complete if hasattr(developer, 'profile_complete') else False,
                "created_at": developer.created_at.isoformat() if developer.created_at else None,
            }
        }
        
        # IMPORTANT: The frontend expects this structure:
        # {
        #   "developer": {
        #     "id": "uuid-string",              # REQUIRED
        #     "github_username": "username",     # REQUIRED
        #     "name": "Full Name",               # REQUIRED (use github_username if null)
        #     "profile_complete": false,         # REQUIRED (defaults to false if missing)
        #     ... other fields optional
        #   }
        # }
        
        # 6. Encode developer data as base64
        json_str = json.dumps(developer_data)
        encoded_data = base64.b64encode(json_str.encode()).decode()
        
        # 7. Build redirect URL to frontend
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
        redirect_url = f"{frontend_url}/auth/callback?data={quote(encoded_data)}&state={state}"
        
        # 8. Create redirect response with cookie
        response = RedirectResponse(url=redirect_url, status_code=302)
        response.set_cookie(
            key="v1_access_token",
            value=access_token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite="lax",
            path="/",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )
        
        logger.info(f"Redirecting to frontend with developer data for {developer.github_username}")
        return response
        
    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        # Redirect to frontend with error
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
        error_url = f"{frontend_url}/signup?error=auth_failed&error_description={quote(str(e))}"
        return RedirectResponse(url=error_url, status_code=302)
```

## Key Points

### 1. Use RedirectResponse, Not JSONResponse
```python
# ❌ Wrong
return JSONResponse({"success": True})

# ✅ Correct
return RedirectResponse(url=redirect_url, status_code=302)
```

### 2. Include Base64-Encoded Developer Data
```python
import base64
import json

developer_data = {"developer": {...}}
json_str = json.dumps(developer_data)
encoded = base64.b64encode(json_str.encode()).decode()
```

### 3. Set Cookie Before Returning Response
```python
response = RedirectResponse(...)
response.set_cookie("v1_access_token", token, ...)
return response
```

### 4. Use FRONTEND_URL from Environment
```python
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
redirect_url = f"{frontend_url}/auth/callback?data={encoded_data}&state={state}"
```

## Testing the Fix

### 1. Check Backend Logs
After fixing, you should see:
```
INFO: Redirecting to frontend with developer data for <username>
```

### 2. Check Browser Network Tab
After GitHub redirects to backend:
- Look for redirect (302) from `/api/v1/auth/github/callback`
- Should redirect to: `http://localhost:8080/auth/callback?data=...&state=...`
- Response should include `Set-Cookie: v1_access_token=...`

### 3. Check Frontend Console
After redirect, you should see:
```
=== OAuth Callback Debug ===
Full URL: http://localhost:8080/auth/callback?data=eyJ...&state=...
Parsed params: {
  data: "eyJkZXZlbG9wZXIiOnsia...",
  state: "1d6c46f5-...",
  error: null
}
```

### 4. Expected Flow
```
User clicks "Continue with GitHub"
  ↓
GitHub authorization page
  ↓
GitHub redirects to: http://localhost:8000/api/v1/auth/github/callback?code=...&state=...
  ↓
Backend processes OAuth (creates user, sets cookie)
  ↓
Backend redirects (302) to: http://localhost:8080/auth/callback?data=BASE64&state=...
  ↓
Frontend decodes data, saves to localStorage
  ↓
Frontend triggers import-all (uses cookie)
  ↓
Frontend navigates to /dashboard or /onboarding
```

## Error Scenario

If backend has an error during OAuth:
```python
except Exception as e:
    logger.error(f"OAuth error: {e}")
    error_url = f"{frontend_url}/signup?error=auth_failed&error_description={quote(str(e))}"
    return RedirectResponse(url=error_url, status_code=302)
```

## Environment Variable Required

Make sure your backend `.env` has:
```env
FRONTEND_URL=http://localhost:8080
```

## Common Mistakes to Avoid

1. ❌ Returning JSON instead of redirecting
2. ❌ Not encoding developer data in base64
3. ❌ Not setting cookie on redirect response
4. ❌ Wrong redirect URL (should go to frontend, not backend)
5. ❌ Not including `state` parameter in redirect
6. ❌ Forgetting `status_code=302` on RedirectResponse

## After the Fix

Once this is fixed, the complete OAuth flow will work:
- ✅ User authenticates with GitHub
- ✅ Backend creates user and sets cookie
- ✅ Frontend receives user data and stores it
- ✅ Repositories are automatically imported
- ✅ User is redirected to dashboard/onboarding

## Need More Help?

Check the frontend console after attempting OAuth. The detailed debug logs will show exactly what URL and parameters were received.

### Troubleshooting: "tokenData.developer is undefined"

If you see this error, the backend is redirecting but sending the wrong data structure.

**Check Console Logs:**
```
=== OAuth Callback Debug ===
Decoded data: {...}
Parsed data structure: {...}
```

**Common Causes:**

1. **Developer at root level instead of nested**
   ```json
   // ❌ Wrong
   {
     "id": "123",
     "github_username": "user"
   }
   
   // ✅ Correct
   {
     "developer": {
       "id": "123",
       "github_username": "user"
     }
   }
   ```

2. **Missing required fields**
   - `id` - Developer UUID (REQUIRED)
   - `github_username` - GitHub username (REQUIRED)
   - `name` - Full name (use github_username if null)
   - `profile_complete` - Boolean (defaults to false if missing)

3. **Invalid JSON encoding**
   - Make sure to use `json.dumps()` before base64 encoding
   - Don't double-encode or send raw strings

**Frontend is now resilient** - it will:
- ✅ Accept both nested and flat structures
- ✅ Validate required fields
- ✅ Set defaults for missing optional fields
- ✅ Show detailed error messages in console

But the **recommended backend structure** is:
```json
{
  "developer": {
    "id": "uuid-string",
    "github_username": "username",
    "name": "Full Name",
    "profile_complete": false,
    ... other fields
  }
}
```
