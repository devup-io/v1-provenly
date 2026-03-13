# Dashboard Debugging Guide

## No Repos Showing? No Evaluations?

### Check Browser Console

Open DevTools → Console and look for:

```
[Dashboard] Loading data for developer: <UUID>
[Dashboard] Fetching projects and stats...
[API] Fetching projects for developer: <UUID>
[API] Projects response: [...]
[API] Fetching aggregate evaluation for developer: <UUID>
[API] Aggregate evaluation response: {...}
[Dashboard] Projects received: [...]
[Dashboard] Stats received: {...}
```

### Common Issues

#### 1. Empty Projects Array (`[]`)

**Symptoms**: 
- Console shows: `[API] Projects response: []`
- Dashboard shows "No repositories imported yet"

**Causes**:
- Projects haven't been imported from GitHub yet
- Import endpoint (`/api/v1/projects/import-all`) failed silently

**Solutions**:
1. Click "Import Your Repositories" button on dashboard
2. Check backend logs during import
3. Verify backend endpoint exists: `GET /api/v1/developers/{id}/projects`

#### 2. Null/Empty Aggregate Evaluation

**Symptoms**:
- Console shows: `[API] Aggregate evaluation response: null` or error
- Dashboard shows "No evaluation data yet" in Statistics card

**Causes**:
- Backend endpoint doesn't exist: `GET /api/v1/developers/{id}/aggregate-evaluation`
- No projects to evaluate yet
- AI evaluation hasn't been run

**Solutions**:
1. Import projects first (need data to evaluate)
2. Click "Run Evaluation" button
3. Check if backend has aggregate evaluation endpoint implemented

#### 3. 404 Errors

**Symptoms**:
```
[API] Failed to fetch projects: Error: {"detail":"Not Found"}
[API] Failed to fetch aggregate evaluation: Error: {"detail":"Not Found"}
```

**Causes**:
- Backend endpoints not implemented yet
- Wrong developer ID (UUID format required)
- Backend routing issues

**Solutions**:

**Check Backend Endpoints**:
```python
# Required endpoints in backend:

# 1. Get developer's projects
@router.get("/api/v1/developers/{developer_id}/projects")
async def get_developer_projects(developer_id: str):
    # Return list of Project objects
    return [
        {
            "id": "uuid",
            "developer_id": developer_id,
            "name": "repo-name",
            "description": "...",
            "github_url": "https://github.com/user/repo",
            "language": "Python",
            "stars": 10,
            "forks": 2,
            "commits_count": 50,
            "ai_evaluation": {
                "difficulty_tier": "Intermediate",
                "ai_status": "completed",
                "overall_assessment": "...",
                ...
            },
            ...
        }
    ]

# 2. Get aggregate evaluation
@router.get("/api/v1/developers/{developer_id}/aggregate-evaluation")
async def get_aggregate_evaluation(developer_id: str):
    return {
        "developer_id": developer_id,
        "total_projects": 5,
        "overall_skill_level": "Intermediate",  # "Beginner" | "Intermediate" | "Advanced" | "Expert"
        "total_commits": 250,
        "primary_technologies": ["Python", "TypeScript", "React"],
        "difficulty_distribution": {
            "Beginner": 1,
            "Intermediate": 3,
            "Advanced": 1
        },
        "strongest_areas": ["Full-stack development", "API design"],
        "projects": [...]  # Optional: include full project data
    }
```

#### 4. Import Succeeded But No Projects

**Symptoms**:
- Import completes with 200 OK
- Backend logs show repos fetched
- Dashboard still shows 0 projects

**Causes**:
- Projects imported but not saved to database
- GET endpoint returns empty even though POST succeeded
- Wrong developer ID being used

**Debug**:
1. Check backend database for projects:
   ```sql
   SELECT * FROM projects WHERE developer_id = '<UUID>';
   ```

2. Verify import actually saves to DB:
   ```python
   # In import endpoint
   for repo in github_repos:
       project = Project(developer_id=developer.id, ...)
       db.add(project)
   db.commit()  # Make sure this is called!
   ```

3. Check developer ID matches:
   ```
   Frontend using: <UUID from localStorage>
   Backend saved: <UUID from database>
   ```

## Testing the Fix

### 1. Test Import Endpoint Directly

```bash
# Get your developer ID from localStorage
# In browser console:
JSON.parse(localStorage.getItem('v1_developer')).id

# Test import with curl (replace UUID)
curl -X POST "http://localhost:8000/api/v1/projects/import-all?evaluate_ai=true" \
  -H "Cookie: v1_access_token=YOUR_TOKEN" \
  -v
```

### 2. Test GET Projects Endpoint

```bash
curl "http://localhost:8000/api/v1/developers/YOUR_UUID/projects" \
  -H "Cookie: v1_access_token=YOUR_TOKEN" \
  -v
```

Expected: Array of projects

### 3. Test Aggregate Evaluation Endpoint

```bash
curl "http://localhost:8000/api/v1/developers/YOUR_UUID/aggregate-evaluation" \
  -H "Cookie: v1_access_token=YOUR_TOKEN" \
  -v
```

Expected: Evaluation object with stats

## Backend Implementation Checklist

- [ ] Import endpoint saves projects to database
- [ ] GET `/developers/{id}/projects` endpoint exists and returns projects
- [ ] GET `/developers/{id}/aggregate-evaluation` endpoint exists
- [ ] Projects have `ai_evaluation` relationship working
- [ ] Developer ID format is consistent (UUID)
- [ ] CORS allows credentials from frontend
- [ ] Cookie authentication works on all endpoints

## Quick Fixes

### If No Backend Endpoints Exist Yet

The frontend is ready but needs these backend endpoints. Frontend will gracefully handle:
- Empty projects array → Shows "Import" CTA
- Null stats → Shows "Run Evaluation" button
- 404 errors → Logs to console, doesn't crash

### Temporary: Mock Data for Testing Frontend

If backend isn't ready, you can temporarily mock data in the Dashboard:

```typescript
// In Dashboard.tsx, replace loadData with:
const mockProjects = [
  {
    id: "1",
    name: "example-repo",
    description: "A test repository",
    language: "TypeScript",
    stars: 5,
    commits_count: 20,
    github_url: "https://github.com/user/repo",
    ai_evaluation: {
      difficulty_tier: "Intermediate",
      ai_status: "completed",
      overall_assessment: "Good work!"
    }
  }
];

const mockStats = {
  total_projects: 1,
  overall_skill_level: "Intermediate",
  total_commits: 20,
  primary_technologies: ["TypeScript", "React"]
};

setProjects(mockProjects);
setStats(mockStats);
```

This will let you see the UI while backend is being implemented.
