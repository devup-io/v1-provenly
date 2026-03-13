# Debugging: Repos Importing But Not Displaying

## What I've Enhanced

I've added **comprehensive logging** throughout the repo import and fetch flow:

### 1. Dashboard.tsx Logging
- Shows exact developer ID format and type  
- Logs API URLs being called
- Shows what data is returned from each API call
- Displays array length and structure

### 2. api.ts Logging
- **importAllProjects()** - Shows full URL and each retry attempt
- **getDeveloperProjects()** - Shows endpoint, full URL, and exact response
- **getAggregateEvaluation()** - Shows endpoint and response

### 3. Added 1-second delay after import
- Gives backend time to save projects before fetching
- Reduces race condition issues

---

## Testing Steps

### Step 1: Open Dashboard and Check Console

1. Go to http://localhost:8080/dashboard
2. Open DevTools (F12 → Console tab)
3. Look for logs starting with `[Dashboard]` and `[API]`

### Expected Logs (First Load)

```
[Dashboard] Loading data for developer:
  - ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  - Username: your-github-username
  - ID Type: string
  - Full developer object keys: [
      'id', 'github_username', 'github_avatar', 
      'name', 'bio', 'primary_role', 'primary_stack', 
      'profile_complete'
    ]

[Dashboard] Fetching projects and stats for developer: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

[API] Fetching projects:
  - Developer ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  - Endpoint: /api/v1/developers/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/projects
  - Full URL: http://localhost:8000/api/v1/developers/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/projects

[API] Projects response received:
  - Type: object
  - Is Array: true
  - Length: X  ← KEY: Should be > 0 if repos are imported
  - Data: [...]
```

---

## Common Issues & Solutions

### 🔴 **Issue 1: Projects response is empty array `[]`**

**Console shows:**
```
[API] Projects response received:
  - Length: 0
  - Data: []
```

**Causes:**
1. Projects haven't been imported yet
2. Import succeeded but didn't save to database
3. Developer ID used during import doesn't match fetch

**Solutions:**

a) **Try importing manually:**
   - Click "Import More Repos" button
   - Check console for import logs:
     ```
     [API] Importing projects:
       - URL: /api/v1/projects/import-all?evaluate_ai=true
       - Full URL: http://localhost:8000/api/v1/projects/import-all?evaluate_ai=true
     [API] Import attempt 1/3...
     [API] Project import completed successfully
     ```

b) **If import fails with 401:**
   - Makes sure you're logged in
   - Session cookie might not be persisted
   - Check if `v1_access_token` cookie exists in DevTools → Application → Cookies

c) **Check backend:**
   ```bash
   # Look at backend logs during import
   # Backend should show project fetches from GitHub
   ```

---

### 🔴 **Issue 2: API returns 404 error**

**Console shows:**
```
[API] Failed to fetch projects:
  - Error: Error: Not Found
  - Message: Not Found
```

**Causes:**
- Backend endpoint doesn't exist
- Wrong developer ID format

**Solutions:**

Check that backend has these routes:
```python
# Required in backend:
@router.get("/api/v1/developers/{developer_id}/projects")
async def get_developer_projects(developer_id: str):
    # Should return list of Project objects
    ...

@router.get("/api/v1/developers/{developer_id}/aggregate-evaluation")  
async def get_aggregate_evaluation(developer_id: str):
    # Should return AggregateEvaluation object
    ...
```

---

### 🟡 **Issue 3: Developer ID mismatch**

**Symptoms:**
- Import shows different developer ID than fetch
- Projects imported but can't be retrieved

**Check:**
Look at console logs - compare:
```
[Dashboard] Loading data for developer:
  - ID: abc123...  ← This should match
  
[Dashboard] Starting import with developer ID: abc123...  ← And this
```

If they're different, there's a state issue.

---

## Manual Testing with curl

### Get your developer ID:

```bash
# In browser console:
JSON.parse(localStorage.getItem('v1_developer')).id
# Copy the UUID output
```

### Test each endpoint:

```bash
# Test get projects
DEV_ID="your-uuid-from-above"
curl -X GET "http://localhost:8000/api/v1/developers/$DEV_ID/projects" \
  --cookie "v1_access_token=YOUR_COOKIE" \
  -v

# Test aggregate evaluation
curl -X GET "http://localhost:8000/api/v1/developers/$DEV_ID/aggregate-evaluation" \
  --cookie "v1_access_token=YOUR_COOKIE" \
  -v

# Test import
curl -X POST "http://localhost:8000/api/v1/projects/import-all?evaluate_ai=true" \
  --cookie "v1_access_token=YOUR_COOKIE" \
  -v
```

Expected responses:
- Import: 200 OK
- Get projects: 200 OK with `[{id, name, language, ...}, ...]`
- Get eval: 200 OK with `{total_projects, overall_skill_level, ...}`

---

## Database Verification

If you have access to the backend database:

```sql
-- Count projects for your developer
SELECT COUNT(*) FROM projects 
WHERE developer_id = 'your-uuid-from-console';

-- See project details
SELECT id, name, language, stars, commits_count 
FROM projects 
WHERE developer_id = 'your-uuid-from-console'
LIMIT 5;

-- Check evaluations exist
SELECT p.name, e.difficulty_tier, e.ai_status
FROM projects p
LEFT JOIN ai_evaluations e ON p.id = e.project_id
WHERE p.developer_id = 'your-uuid-from-console';
```

---

## Next Steps

1. **Reload dashboard** at http://localhost:8080/dashboard
2. **Open console** and look for `[API] Projects response received:`
3. **Share the console output** showing:
   - Developer ID
   - Projects array length
   - Any error messages

Based on that, we can identify if the issue is:
- ✅ Backend not creating projects during import
- ✅ Backend not returning projects on fetch
- ✅ Wrong developer ID being used
- ✅ Authentication issue with session cookie

---

## Quick Debug Checklist

- [ ] Developer ID is a UUID (36 chars, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- [ ] Console shows developer loaded successfully
- [ ] Import attempts to POST to `/api/v1/projects/import-all?evaluate_ai=true`
- [ ] Get Projects attempts to GET `/api/v1/developers/{id}/projects`
- [ ] Projects array is either empty `[]` or has items `[{...}, {...}]`
- [ ] No 401/403 errors (auth working)
- [ ] No 404 errors (endpoints exist)
