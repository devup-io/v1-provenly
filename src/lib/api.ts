import type { V1AuthToken, DeveloperProfile, Repo, GitHubAuthorizeResponse, GitHubStatusResponse, Project, AIEvaluation, AggregateEvaluation, GitHubOrganization, V1ImportAllResponse, SupportedDevTypes, UserSettings, DeveloperFullDetailsResponse, ProjectEvaluationLog, HireDeveloperPayload, DevTypesResponse, DevTypesLanguagesResponse, DeveloperAnalyzerChartsResponse } from "@/types/api";
import type { DeveloperSearchResponse, DeveloperSearchFilters } from "@/types/developer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const DEVELOPER_KEY = "v1_developer";
const OAUTH_STATE_KEY = "v1_oauth_state";

// Extract difficulty tier from backend complexity level string
function extractDifficultyTier(complexityLevel: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
  const lower = complexityLevel.toLowerCase();
  if (lower.includes('beginner') || lower.includes('level 1')) {
    return 'Beginner';
  } else if (lower.includes('intermediate') || lower.includes('level 2')) {
    return 'Intermediate';
  } else if (lower.includes('advanced') || lower.includes('level 3')) {
    return 'Advanced';
  } else if (lower.includes('expert') || lower.includes('level 4')) {
    return 'Expert';
  }
  return 'Intermediate'; // Default fallback
}

// Transform backend project response to frontend Project type
function transformBackendProject(raw: Record<string, unknown>): Project {
  // Extract github_metadata, commit_metrics, and complexity if present
  const githubMetadata = (raw.github_metadata as Record<string, unknown>) || {};
  const commitMetrics = (raw.commit_metrics as Record<string, unknown>) || {};
  const complexity = (raw.complexity as Record<string, unknown>) || {};
  
  const aiEvaluation = (raw.ai_evaluation as Record<string, unknown>) || {};
  
  console.log('[API] Transforming project - Structure:', {
    topLevelKeys: Object.keys(raw),
    hasGithubMetadata: 'github_metadata' in raw,
    hasCommitMetrics: 'commit_metrics' in raw,
    hasComplexity: 'complexity' in raw,
    hasAiEvaluation: 'ai_evaluation' in raw,
    githubMetadataKeys: Object.keys(githubMetadata),
    commitMetricsKeys: Object.keys(commitMetrics),
    aiEvaluationKeys: Object.keys(aiEvaluation),
    topLevelCommitsCount: raw.commits_count,
    commitMetricsTotalCommits: commitMetrics.total_commits,
    githubMetadataCommitsCount: githubMetadata.commits_count,
    aiEvaluation_repo_score: aiEvaluation.repo_score,
    aiEvaluation_difficulty_tier: aiEvaluation.difficulty_tier,
  });
  
  // Helper to safely get string value with fallbacks
  const getString = (...keys: (string | { obj: Record<string, unknown>; key: string })[]): string | undefined => {
    for (const item of keys) {
      let val: unknown;
      if (typeof item === 'string') {
        val = raw[item];
      } else {
        val = item.obj[item.key];
      }
      if (val && typeof val === 'string' && val.trim() !== '') {
        return val;
      }
    }
    return undefined;
  };
  
  // Helper to safely get number value with fallbacks
  const getNumber = (...keys: (string | { obj: Record<string, unknown>; key: string })[]): number | undefined => {
    for (const item of keys) {
      let val: unknown;
      if (typeof item === 'string') {
        val = raw[item];
      } else {
        val = item.obj[item.key];
      }
      if (typeof val === 'number') {
        return val;
      }
      if (typeof val === 'string') {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          return num;
        }
      }
    }
    return undefined;
  };
  
  const transformed: Project = {
    id: String(raw.id),
    developer_id: String(raw.developer_id),
    name: getString(
      'name',
      'repo_name',
      { obj: githubMetadata, key: 'repo_name' },
      { obj: githubMetadata, key: 'repo_full_name' }
    ) || 'Unnamed Repository',
    description: getString(
      'description',
      { obj: githubMetadata, key: 'description' }
    ),
    github_url: getString(
      'github_url',
      'url',
      { obj: githubMetadata, key: 'repo_url' },
      { obj: githubMetadata, key: 'html_url' }
    ),
    language: getString(
      'language',
      { obj: githubMetadata, key: 'language' },
      { obj: githubMetadata, key: 'primary_language' }
    ),
    stars: getNumber(
      'stars',
      { obj: githubMetadata, key: 'stars' },
      { obj: githubMetadata, key: 'stargazers_count' }
    ),
    forks: getNumber(
      'forks',
      { obj: githubMetadata, key: 'forks' }
    ),
    commits_count: getNumber(
      'commits_count',
      { obj: commitMetrics, key: 'total_commits' },
      { obj: githubMetadata, key: 'commits_count' }
    ),
    // propagate contribution/verification flags from ai_evaluation if present
    contribution_level: getString({ obj: aiEvaluation, key: 'contribution_level' }) as Project['contribution_level'],
    verified_badge: aiEvaluation.verified_badge === true,
    last_updated: getString(
      'last_updated',
      { obj: githubMetadata, key: 'updated_at' },
      { obj: githubMetadata, key: 'pushed_at' }
    ),
    // forward raw objects so callers can inspect additional metadata if needed
    github_metadata: githubMetadata,
    commit_metrics: commitMetrics,
    complexity: complexity,
    engineering_signals: (raw.engineering_signals as Record<string, unknown>) || undefined,
    repository_quality: getNumber('repository_quality'),
    collaborative_development: getNumber('collaborative_development'),
    // propagate warnings if backend returns them
    warnings: Array.isArray(raw.warnings) ? (raw.warnings as string[]) : undefined,
    evaluation_status: (raw.evaluation_status as Project['evaluation_status']) || undefined,
    status: (raw.status as string) || undefined,
    analyzed_at: getString('analyzed_at'),
    ai_evaluation: {
      id: String(raw.id),
      project_id: String(raw.id),
      developer_id: String(raw.developer_id),
      ai_status: 'completed' as const,
      difficulty_tier: getString({ obj: aiEvaluation, key: 'difficulty_tier' }) || extractDifficultyTier(String(complexity.level || '')),
      overall_assessment: getString({ obj: complexity, key: 'explanation' }) || getString({ obj: aiEvaluation, key: 'summary' }),
      // Extract scores from ai_evaluation object
      repo_score: getNumber({ obj: aiEvaluation, key: 'repo_score' }),
      engineering_depth_score: getNumber({ obj: aiEvaluation, key: 'engineering_depth_score' }),
      architecture_score: getNumber({ obj: aiEvaluation, key: 'architecture_score' }),
      code_quality_score: getNumber({ obj: aiEvaluation, key: 'code_quality_score' }),
      production_readiness_score: getNumber({ obj: aiEvaluation, key: 'production_readiness_score' }),
      commit_quality_score: getNumber({ obj: aiEvaluation, key: 'commit_quality_score' }),
      estimated_developer_level: getString({ obj: aiEvaluation, key: 'estimated_developer_level' }),
      primary_role_alignment: getString({ obj: aiEvaluation, key: 'primary_role_alignment' }),
      summary: getString({ obj: aiEvaluation, key: 'summary' }),
      strengths: Array.isArray(aiEvaluation.strengths) ? aiEvaluation.strengths as string[] : undefined,
      weaknesses: Array.isArray(aiEvaluation.weaknesses) ? aiEvaluation.weaknesses as string[] : undefined,
      recommendations: Array.isArray(aiEvaluation.recommendations) ? aiEvaluation.recommendations as string[] : undefined,
    } as AIEvaluation,
    created_at: getString(
      'created_at',
      { obj: githubMetadata, key: 'created_at' }
    ),
    updated_at: getString(
      'updated_at',
      { obj: githubMetadata, key: 'updated_at' }
    ),
  };
  
  console.log('[API] Project transformed result:', {
    name: transformed.name,
    commits_count: transformed.commits_count,
    ai_evaluation: {
      repo_score: transformed.ai_evaluation?.repo_score,
      engineering_depth_score: transformed.ai_evaluation?.engineering_depth_score,
      architecture_score: transformed.ai_evaluation?.architecture_score,
      code_quality_score: transformed.ai_evaluation?.code_quality_score,
      production_readiness_score: transformed.ai_evaluation?.production_readiness_score,
      commit_quality_score: transformed.ai_evaluation?.commit_quality_score,
      difficulty_tier: transformed.ai_evaluation?.difficulty_tier,
      estimated_developer_level: transformed.ai_evaluation?.estimated_developer_level,
    },
  });
  
  console.log('[API] Raw ai_evaluation from backend:', raw.ai_evaluation);
  return transformed;
}

// Transform backend aggregate evaluation to frontend type
function transformBackendAggregateEvaluation(raw: Record<string, unknown>): AggregateEvaluation {
  console.log('[API] Transforming aggregate evaluation:', {
    hasOverall: 'overall' in raw,
    hasDifficultyTierDist: 'difficulty_tier_distribution' in raw,
    keys: Object.keys(raw)
  });

  // Extract overall object
  const overall = (raw.overall as Record<string, unknown>) || {};
  
  // Get skill level from overall.estimated_developer_level or overall.difficulty_tier
  const skillLevel = (overall.estimated_developer_level as string) || (overall.difficulty_tier as string) || 'Beginner';
  
  // Get difficulty distribution
  const difficultyDist = (raw.difficulty_tier_distribution as Record<string, number>) || {};
  
  // Extract technologies from projects or use role alignment
  let technologies: string[] = [];
  if (raw.projects && Array.isArray(raw.projects)) {
    // Get unique languages from projects - check both top level and github_metadata
    const languages = raw.projects
      .map((p: Record<string, unknown>) => {
        const githubMeta = (p.github_metadata as Record<string, unknown>) || {};
        return (p.language as string) || (githubMeta.language as string);
      })
      .filter((lang): lang is string => typeof lang === 'string' && lang !== null);
    technologies = Array.from(new Set(languages));
  }
  
  // If no technologies from projects, try to extract from role alignment
  if (technologies.length === 0 && raw.role_alignment_distribution) {
    const roleAlign = raw.role_alignment_distribution as Record<string, number>;
    technologies = Object.keys(roleAlign);
  }
  
  // Calculate total commits from projects
  let totalCommits = 0;
  if (raw.projects && Array.isArray(raw.projects)) {
    totalCommits = raw.projects.reduce((sum: number, p: Record<string, unknown>) => {
      // Check commit_metrics.total_commits first, then top-level commits_count
      const commitMetrics = (p.commit_metrics as Record<string, unknown>) || {};
      const commits = (commitMetrics.total_commits as number) || (p.commits_count as number) || 0;
      return sum + commits;
    }, 0);
  }
  
  // Extract strongest areas from role alignment or overall
  const strongestAreas: string[] = [];
  if (raw.role_alignment_distribution) {
    const roleAlign = raw.role_alignment_distribution as Record<string, number>;
    // Sort by count and take top 2
    const sorted = Object.entries(roleAlign).sort(([, a], [, b]) => (b as number) - (a as number));
    strongestAreas.push(...sorted.slice(0, 2).map(([name]) => name));
  }
  if (overall.primary_role_alignment && typeof overall.primary_role_alignment === 'string') {
    if (!strongestAreas.includes(overall.primary_role_alignment)) {
      strongestAreas.unshift(overall.primary_role_alignment);
    }
  }
  
  // Transform projects if they exist
  let transformedProjects: Project[] = [];
  if (raw.projects && Array.isArray(raw.projects)) {
    transformedProjects = raw.projects.map((p: Record<string, unknown>) => transformBackendProject(p));
  }

  // Extract repository_quality and collaborative_development from backend
  // These are aliases for average_scores.code_quality_score and commit_quality_score
  const repositoryQuality = typeof raw.repository_quality === 'number' ? raw.repository_quality : undefined;
  const collaborativeDevelopment = typeof raw.collaborative_development === 'number' ? raw.collaborative_development : undefined;

  console.log('[API] Aggregate evaluation fields:', {
    repository_quality: repositoryQuality,
    collaborative_development: collaborativeDevelopment,
  });

  // include new count fields if available
  const evalProfileCounts = raw.evaluation_profile_counts as Record<string, number> | undefined;
  const detectedTypeCounts = raw.detected_project_type_counts as Record<string, number> | undefined;
  const declaredRole = typeof raw.developer_declared_role === 'string' ? raw.developer_declared_role : undefined;

  return {
    developer_id: String(raw.developer_id),
    total_projects: (raw.total_projects as number) || 0,
    overall_skill_level: skillLevel as "Beginner" | "Intermediate" | "Advanced" | "Expert",
    difficulty_distribution: difficultyDist,
    primary_technologies: technologies.slice(0, 5), // Top 5 technologies
    total_commits: totalCommits,
    strongest_areas: strongestAreas,
    projects: transformedProjects,
    repository_quality: repositoryQuality,
    collaborative_development: collaborativeDevelopment,
    evaluation_profile_counts: evalProfileCounts,
    detected_project_type_counts: detectedTypeCounts,
    developer_declared_role: declaredRole,
  };
}


type ApiRequestOptions = RequestInit & { expectJson?: boolean };

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { headers, expectJson = true, ...rest } = options;
  const fullUrl = `${API_BASE_URL}${path}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${rest.method || 'GET'} ${path}`);
  }


  const res = await fetch(fullUrl, {
    credentials: 'include',
    mode: 'cors',
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    ...rest,
  });

  if (process.env.NODE_ENV === 'development') {
    const corsHeaders = {
      hasCredentials: res.headers.get('Access-Control-Allow-Credentials'),
      origin: res.headers.get('Access-Control-Allow-Origin'),
    };
    console.log(`[API Response] Status: ${res.status}`, corsHeaders);
  }

  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401) {
      console.warn('[API] Received 401 Unauthorized - check if session cookie is valid');
    }

    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (!expectJson || res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
};

// OAuth Flow Functions
export async function getGitHubAuthorize(): Promise<GitHubAuthorizeResponse> {
  try {
    return await apiRequest<GitHubAuthorizeResponse>("/api/v1/auth/github/authorize", {
      method: "GET",
    });
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Cannot connect to backend. Make sure the backend server is running at http://localhost:8000 and CORS is configured.');
    }
    throw err;
  }
}

export async function getGitHubStatus(state: string): Promise<GitHubStatusResponse> {
  return apiRequest<GitHubStatusResponse>(`/api/v1/auth/github/status?state=${encodeURIComponent(state)}`, {
    method: "GET",
  });
}

// fetch draft profile for review/publish step
export async function getProfilePreview(): Promise<DeveloperProfile> {
  return apiRequest<DeveloperProfile>(`/api/v1/profile/preview`, {
    method: "GET",
  });
}

// trigger publication of current profile
export async function publishProfile(): Promise<void> {
  await apiRequest<void>(`/api/v1/profile/publish`, {
    method: "POST",
    expectJson: false,
  });
}

// reverse publication (make profile private again)
export async function unpublishProfile(): Promise<void> {
  await apiRequest<void>(`/api/v1/profile/unpublish`, {
    method: "POST",
    expectJson: false,
  });
}

export async function importAllProjects(state?: string, selectedRepoNames?: string[]): Promise<void> {
  const params = new URLSearchParams({ evaluate_ai: "true" });
  if (state && state !== 'undefined') {
    params.set("oauth_state", state);
  }

  const url = `/api/v1/projects/import-all?${params.toString()}`;
  console.log('[API] Importing projects:');
  console.log('  - URL:', url);
  console.log('  - Full URL:', `${API_BASE_URL}${url}`);
  if (selectedRepoNames) {
    console.log('  - Selected repo names:', selectedRepoNames);
  }
  
  // Retry logic: cookie may not be set immediately after OAuth redirect
  let lastError: Error | null = null;
  const maxRetries = 3;
  const delays = [500, 1000, 2000]; // ms between retries

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[API] Import attempt ${attempt}/${maxRetries}...`);
      await apiRequest<void>(url, {
        method: "POST",
        expectJson: false,
        body: selectedRepoNames ? JSON.stringify({ selected_repos: selectedRepoNames }) : undefined,
      });
      console.log('[API] Project import completed successfully');
      return; // Success!
    } catch (err) {
      lastError = err as Error;
      console.log(`[API] Import attempt ${attempt} response:`, err);
      
      if (!(err instanceof Error) || !err.message.includes('401')) {
        // Non-auth error, don't retry
        console.error('[API] Project import failed (non-auth error):', err);
        throw err;
      }
      
      if (attempt < maxRetries) {
        const delay = delays[attempt - 1];
        console.warn(`[API] Import got 401, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('[API] Project import failed on all retries with 401');
      }
    }
  }

  // All retries exhausted with 401
  if (lastError) {
    const helpText = `
Session Cookie Issue:
1. Check DevTools → Application → Cookies
2. Look for 'v1_access_token' or similar auth cookie
3. If missing: Backend OAuth callback didn't set cookie
4. If present: Backend import endpoint not recognizing it

Backend OAuth callback must:
- Return 302 redirect with Set-Cookie header
- Cookie must have: HttpOnly, Path=/, SameSite=Lax
- For development: may need Secure=false if using http://

Frontend can continue without auto-import. You can manually import repos from dashboard.
    `.trim();
    console.error(helpText);
    throw new Error('Import failed after retries: ' + lastError.message);
  }
}

export function saveOAuthState(state: string) {
  try {
    localStorage.setItem(OAUTH_STATE_KEY, state);
  } catch (e) {
    // ignore
  }
}

export function getOAuthState(): string | null {
  try {
    return localStorage.getItem(OAUTH_STATE_KEY);
  } catch (e) {
    return null;
  }
}

export function clearOAuthState() {
  try {
    localStorage.removeItem(OAUTH_STATE_KEY);
  } catch (e) {
    // ignore
  }
}

export async function postGitHubCallback(code: string, state: string): Promise<V1AuthToken> {
  const data = await apiRequest<V1AuthToken>("/api/v1/auth/github/callback", {
    method: "POST",
    body: JSON.stringify({ code, state }),
  });

  if (data?.developer) saveDeveloper(data.developer);
  return data as V1AuthToken;
}

export function saveDeveloper(dev: DeveloperProfile) {
  try {
    localStorage.setItem(DEVELOPER_KEY, JSON.stringify(dev));
  } catch (e) {
    // ignore
  }
}

export function getDeveloper(): DeveloperProfile | null {
  try {
    const raw = localStorage.getItem(DEVELOPER_KEY);
    return raw ? (JSON.parse(raw) as DeveloperProfile) : null;
  } catch (e) {
    return null;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(DEVELOPER_KEY);
    localStorage.removeItem(OAUTH_STATE_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Get the currently authenticated developer from the server
 * Calls /api/v1/me which validates the JWT token
 * Returns the developer profile with accurate profile_complete status
 */
export async function getCurrentDeveloper(): Promise<DeveloperProfile> {
  try {
    console.log('[API] Fetching current user from /api/v1/me');
    const data = await apiRequest<DeveloperProfile>("/api/v1/me", {
      method: "GET",
    });
    
    console.log('[API] Current developer received:', {
      id: data.id,
      username: data.github_username,
      profile_complete: data.profile_complete,
      name: data.name,
    });
    
    // Update localStorage with accurate data
    saveDeveloper(data);
    
    return data;
  } catch (err) {
    console.error('[API] Failed to fetch current developer:', err);
    throw err;
  }
}

export async function fetchPublicReposByUsername(username: string): Promise<Repo[]> {
  type GitHubRepo = {
    id: number | string;
    name: string;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    updated_at?: string;
    description?: string | null;
    html_url?: string;
  };

  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as GitHubRepo[] | null;
  return (data || []).map((r) => ({
    id: String(r.id),
    name: r.name,
    language: r.language ?? null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    lastUpdated: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    description: r.description ?? null,
    url: r.html_url,
  }));
}

export async function fetchAuthenticatedRepos(): Promise<Repo[]> {
  type GitHubRepo = {
    id: number | string;
    name: string;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    updated_at?: string;
    description?: string | null;
    html_url?: string;
  };

  const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as GitHubRepo[] | null;
  return (data || []).map((r) => ({
    id: String(r.id),
    name: r.name,
    language: r.language ?? null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    lastUpdated: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    description: r.description ?? null,
    url: r.html_url,
  }));
}

/**
 * Fetch user's GitHub organizations via backend
 * Backend has the GitHub access token, so we call backend endpoint instead of GitHub API directly
 */
export async function fetchGitHubOrganizations(): Promise<GitHubOrganization[]> {
  type BackendOrgResponse = {
    count: number;
    organizations: Array<{
      id: number;
      login: string;
      avatar_url: string;
      description: string | null;
      url: string;
    }>;
  };

  try {
    const data = await apiRequest<BackendOrgResponse>("/api/v1/projects/organizations", {
      method: "GET",
    });

    console.log('[API] Organizations fetched:', data.count);
    return (data.organizations || []).map((org) => ({
      id: org.id,
      login: org.login,
      avatar_url: org.avatar_url,
      description: org.description,
    }));
  } catch (err) {
    console.warn('[API] Failed to fetch organizations:', err);
    return [];
  }
}

/**
 * Fetch repositories for selection (lists only, no importing yet)
 * Backend returns available repos from specific org/user with 50ms response
 */
export async function fetchReposByOwner(ownerLogin: string): Promise<Repo[]> {
  type BackendImportListResponse = {
    target: string;
    total_repos_found: number;
    message: string;
    import_results: Array<{
      repo_name: string;
      status: "available" | "already_imported";
      repo_id: string;
      metadata: {
        url: string;
        language?: string | null;
        stars?: number;
        forks?: number;
        description?: string | null;
        full_name: string;
        clone_url?: string;
      };
    }>;
    imported_count: number;
  };

  try {
    const params = new URLSearchParams({
      include_organizations: "false",
      limit: "100",
      org_or_user: ownerLogin,
    });

    console.log(`[API] Fetching repos for ${ownerLogin}...`);
    const data = await apiRequest<BackendImportListResponse>(
      `/api/v1/projects/import-all?${params.toString()}`,
      {
        method: "POST",
      }
    );

    console.log(`[API] Found ${data.total_repos_found} repos, ${data.imported_count} already imported`);

    return (data.import_results || []).map((result) => ({
      id: result.repo_id,
      name: result.repo_name,
      language: result.metadata?.language ?? null,
      stars: result.metadata?.stars ?? 0,
      forks: result.metadata?.forks ?? 0,
      lastUpdated: new Date().toISOString(),
      description: result.metadata?.description ?? null,
      url: result.metadata?.url,
      owner: ownerLogin,
      full_name: result.metadata?.full_name,
      already_imported: result.status === "already_imported",
    }));
  } catch (err) {
    console.warn(`[API] Failed to fetch repos for ${ownerLogin}:`, err);
    return [];
  }
}

/**
 * Import selected repositories to user's profile
 * Backend queues them in background or completes immediately.
 */
export async function importSelectedRepos(repoFullNames: string[]): Promise<{ status: string; queued_count?: number; imported_projects?: unknown[]; queue_threshold?: number; skipped?: Array<{ repo: string; reason: string }>; }> {
  type BackendImportResponse = {
    status: "completed" | "queued" | "failed";
    queued_count?: number;
    imported_projects?: unknown[]; // may include repo ids
    queue_threshold?: number;
    skipped?: Array<{ repo: string; reason: string }>;
    message?: string;
  };

  try {
    console.log(`[API] Submitting ${repoFullNames.length} repos:`, repoFullNames);
    const data = await apiRequest<BackendImportResponse>(
      "/api/v1/projects/repositories/submit?evaluate_ai=true",
      {
        method: "POST",
        body: JSON.stringify({
          selected_repos: repoFullNames,
        }),
      }
    );

    console.log(`[API] submit response`, data);
    return data;
  } catch (err) {
    console.error("[API] Failed to submit selected repos:", err);
    throw err;
  }
}

// fetch available repositories for import, including AI metadata
export async function fetchAvailableRepos(ownerLogin: string, limit = 100, includeOrganizations: boolean | null = null): Promise<V1ImportAllResponse> {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      org_or_user: ownerLogin,
    });
    // default behaviour: server already infers from settings if available,
    // but we can override by providing flag
    if (includeOrganizations !== null) {
      params.set('include_organizations', includeOrganizations ? 'true' : 'false');
    }
    console.log(`[API] Fetching available repos for ${ownerLogin}`, { includeOrganizations });
    const data = await apiRequest<V1ImportAllResponse>(
      `/api/v1/projects/repositories/available?${params.toString()}`,
      { method: "GET" }
    );
    console.log('[API] available repos response', data);
    return data;
  } catch (err) {
    console.warn('[API] Error fetching available repos:', err);
    throw err;
  }
}

// supported developer types (legacy endpoint)
export async function getSupportedDevTypes(): Promise<SupportedDevTypes> {
  try {
    const data = await apiRequest<SupportedDevTypes>("/api/v1/projects/supported-dev-types", {
      method: "GET",
    });
    return data;
  } catch (err) {
    console.warn('[API] Failed to fetch supported dev types', err);
    return [];
  }
}

// Modern dev-types + language selection endpoints
export async function getDevTypes(): Promise<DevTypesResponse> {
  return apiRequest<DevTypesResponse>("/api/v1/dev-types", {
    method: "GET",
  });
}

export async function getDevTypeLanguages(devTypes: string[]): Promise<DevTypesLanguagesResponse> {
  const params = new URLSearchParams();
  devTypes.forEach((type) => params.append('dev_types', type));
  return apiRequest<DevTypesLanguagesResponse>(`/api/v1/dev-types/languages?${params.toString()}`, {
    method: "GET",
  });
}

// Profile CRUD
export async function createOrReplaceProfile(profile: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
  return apiRequest<DeveloperProfile>('/api/v1/me', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function patchProfile(profile: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
  return apiRequest<DeveloperProfile>('/api/v1/me', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });
}

// Analyzer / chart endpoints
export async function getDeveloperAnalyzer(developerId: string): Promise<unknown> {
  return apiRequest<unknown>(`/api/v1/developers/${encodeURIComponent(developerId)}/analyzer`, {
    method: 'GET',
  });
}

export async function getDeveloperAnalyzerCharts(developerId: string): Promise<DeveloperAnalyzerChartsResponse> {
  return apiRequest<DeveloperAnalyzerChartsResponse>(`/api/v1/developers/${encodeURIComponent(developerId)}/analyzer/charts`, {
    method: 'GET',
  });
}

export function subscribeToAnalyzerStream(
  developerId: string,
  handlers: {
    onLog: (data: { step: string; status: string; detail?: string; elapsed_ms?: number }) => void;
    onComplete: (data: unknown) => void;
    onError: (err: unknown) => void;
  }
): EventSource {
  const url = `${API_BASE_URL}/api/v1/developers/${encodeURIComponent(developerId)}/analyze-stream`;
  const source = new EventSource(url, { withCredentials: true });

  source.addEventListener('log', (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent).data);
      handlers.onLog(payload);
    } catch (e) {
      console.warn('Failed to parse log event', e);
    }
  });

  source.addEventListener('complete', (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent).data);
      handlers.onComplete(payload);
    } catch (e) {
      console.warn('Failed to parse complete event', e);
    }
  });

  source.addEventListener('error', (event) => {
    handlers.onError(event);
  });

  return source;
}

// (placeholder functions were removed; real implementations below)
// aggregate evaluations
export async function getAggregateEvaluations(): Promise<unknown> {
  try {
    const data = await apiRequest(`/api/v1/projects/evaluations/aggregate`, {
      method: "GET",
    });
    return data;
  } catch (err) {
    console.warn('[API] Failed aggregate evaluations', err);
    throw err;
  }
}

// Project & Evaluation Functions

export async function getDeveloperProjects(userId?: string): Promise<Project[]> {
  // userId parameter is kept for backward compatibility but not used
  const endpoint = `/api/v1/my-projects`;
  console.log('[API] Fetching current user projects:');
  console.log('  - Endpoint:', endpoint);
  console.log('  - Full URL:', `${API_BASE_URL}${endpoint}`);
  try {
    const data = await apiRequest<Record<string, unknown>[]>(endpoint, {
      method: "GET",
    });
    console.log('[API] Projects response received:');
    console.log('  - Type:', typeof data);
    console.log('  - Is Array:', Array.isArray(data));
    console.log('  - Length:', Array.isArray(data) ? data.length : 'N/A');
    console.log('  - First raw project (before transform):', data?.[0]);
    
    // Transform backend response to frontend types
    if (!data || !Array.isArray(data)) {
      console.warn('[API] Projects response is not an array, returning empty');
      return [];
    }
    
    console.log('[API] Starting project transformation...');
    const transformed = data.map((project, index) => {
      console.log(`[API] ========== Transforming project ${index + 1}/${data.length} ==========`);
      const trans = transformBackendProject(project);
      return trans;
    });
    
    console.log('[API] All projects transformed, returning:', transformed.length, 'projects');
    return transformed;
  } catch (err) {
    console.error('[API] Failed to fetch projects:');
    console.error('  - Error:', err);
    console.error('  - Message:', err instanceof Error ? err.message : String(err));
    throw err;
  }
}

// Lookup developer by id
export async function getDeveloperById(id: string): Promise<DeveloperProfile> {
  return apiRequest<DeveloperProfile>(`/api/v1/developers/${encodeURIComponent(id)}`);
}

// Lookup developer by GitHub username
export async function getDeveloperByUsername(username: string): Promise<DeveloperProfile> {
  return apiRequest<DeveloperProfile>(`/api/v1/developers/username/${encodeURIComponent(username)}`);
}

// Fetch complete developer profile + projects + aggregate + summary for public profile page
export async function getDeveloperFullDetails(developerId: string): Promise<DeveloperFullDetailsResponse> {
  return apiRequest<DeveloperFullDetailsResponse>(`/api/v1/developers/${encodeURIComponent(developerId)}/full-details`, {
    method: 'GET',
  });
}

// Fetch developer summary data (for analysis page)
export async function getDeveloperSummary(developerId: string): Promise<unknown> {
  return apiRequest<unknown>(`/api/v1/developers/${encodeURIComponent(developerId)}/summary`);
}

// Search founders/developers for hiring signals
export async function searchDevelopers(
  filters: DeveloperSearchFilters = {}
): Promise<DeveloperSearchResponse> {
  const params = new URLSearchParams();
  if (filters.service) params.append('service', filters.service);
  if (filters.role) params.append('role', filters.role);
  if (filters.technologies) {
    filters.technologies.forEach((tech) => params.append('technologies', tech));
  }
  if (filters.complexity_levels) {
    filters.complexity_levels.forEach((lvl) => params.append('complexity_levels', lvl));
  }
  if (filters.complexity_filter) params.append('complexity_filter', filters.complexity_filter);
  if (filters.min_verified_projects !== undefined) params.append('min_verified_projects', String(filters.min_verified_projects));
  // our type now includes min_selected_level_count so no cast is necessary
  if (filters.min_selected_level_count !== undefined) params.append('min_selected_level_count', String(filters.min_selected_level_count));
  if (filters.contribution_level) params.append('contribution_level', filters.contribution_level);
  if (filters.q) params.append('q', filters.q);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_order !== undefined) params.append('sort_order', String(filters.sort_order));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  // endpoint changed from developers/search to search/founders
  const url = `${API_BASE_URL}/api/v1/search/founders?${params.toString()}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Founder search failed: ${res.status}${text ? ` - ${text}` : ''}`);
    }
    const dataRaw = await res.json();
    // backend may return developers under `results` property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = dataRaw;
    // some endpoints may use `results` or `founders` as the payload key
    if (data.results) {
      data.developers = Array.isArray(data.results) ? data.results : [];
    }
    if (data.founders) {
      data.developers = Array.isArray(data.founders) ? data.founders : [];
    }
    if (!data.developers) {
      data.developers = [];
    }
    return data as DeveloperSearchResponse;
  } catch (err) {
    console.error('[API] searchDevelopers error', err);
    throw err;
  }
}

export async function getProjectEvaluation(projectId: string): Promise<AIEvaluation> {
  return apiRequest<AIEvaluation>(`/api/v1/projects/${encodeURIComponent(projectId)}/evaluation`, {
    method: "GET",
  });
}

export async function getAggregateEvaluation(userId?: string): Promise<AggregateEvaluation> {
  // userId parameter is kept for backward compatibility but not used
  const endpoint = `/api/v1/my-aggregate-evaluation`;
  console.log('[API] Fetching current user aggregate evaluation:');
  console.log('  - Endpoint:', endpoint);
  try {
    const data = await apiRequest<Record<string, unknown>>(endpoint, {
      method: "GET",
    });
    console.log('[API] Aggregate evaluation raw response:', data);
    
    // Transform the entire aggregate evaluation response
    const transformed = transformBackendAggregateEvaluation(data);
    console.log('[API] Aggregate evaluation transformed:', {
      total_projects: transformed.total_projects,
      overall_skill_level: transformed.overall_skill_level,
      total_commits: transformed.total_commits,
      primary_technologies: transformed.primary_technologies,
      strongest_areas: transformed.strongest_areas
    });
    
    return transformed;
  } catch (err) {
    console.error('[API] Failed to fetch aggregate evaluation:', err);
    throw err;
  }
}

export async function updateDeveloperProfile(userId: string, updates: {
  name?: string;
  primary_role?: string;
  primary_stack?: string[];
  bio?: string;
}, settings?: Partial<UserSettings>): Promise<DeveloperProfile> {
  const body: Record<string, unknown> = { ...updates };
  if (settings) body.settings = settings;

  const data = await apiRequest<DeveloperProfile>(`/api/v1/me`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  saveDeveloper(data);
  return data as DeveloperProfile;
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    expectJson: false,
  });
  clearAuth();
}

// user settings
export async function getUserSettings(): Promise<UserSettings> {
  try {
    const data = await apiRequest<UserSettings>(`/api/v1/me/settings`, { method: "GET" });
    return data;
  } catch (err) {
    console.warn('[API] Failed to fetch user settings:', err);
    return {} as UserSettings;
  }
}

export async function patchUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const data = await apiRequest<UserSettings>(`/api/v1/me/settings`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return data;
  } catch (err) {
    console.error('[API] Failed to patch user settings:', err);
    throw err;
  }
}

/**
 * Refresh project data after user commits new code
 * This re-evaluates the project with latest GitHub data
 */
export async function refreshProjectData(projectId: string): Promise<Project> {
  try {
    console.log('[API] Refreshing project data:', projectId);
    const data = await apiRequest<Record<string, unknown>>(`/api/v1/projects/${encodeURIComponent(projectId)}/refresh`, {
      method: "POST",
    });

    console.log('[API] Project refreshed, transforming...');
    const transformed = transformBackendProject(data);
    console.log('[API] Transformed refreshed project:', transformed.name);

    return transformed;
  } catch (err) {
    console.error('[API] Failed to refresh project:', err);
    throw err;
  }
}

export async function getProjectEvaluationLogs(projectId: string): Promise<ProjectEvaluationLog[]> {
  const data = await apiRequest<ProjectEvaluationLog[]>(`/api/v1/projects/${encodeURIComponent(projectId)}/evaluation-logs`, {
    method: 'GET',
  });
  return Array.isArray(data) ? data : [];
}

export async function submitHireRequest(developerId: string, payload: HireDeveloperPayload): Promise<{ status?: string; message?: string }> {
  try {
    return await apiRequest<{ status?: string; message?: string }>(`/api/v1/developers/${encodeURIComponent(developerId)}/hire`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (primaryErr) {
    try {
      return await apiRequest<{ status?: string; message?: string }>(`/api/v1/hiring/inquiries`, {
        method: 'POST',
        body: JSON.stringify({ developer_id: developerId, ...payload }),
      });
    } catch {
      throw primaryErr;
    }
  }
}

export type BackendReadinessStatus = {
  ready: boolean;
  error?: string;
};

/**
 * Verify backend and database readiness before loading app routes.
 * /health must return 2xx.
 */
export async function checkBackendReadiness(): Promise<BackendReadinessStatus> {
  const endpoints = ['/health'];

  for (const endpoint of endpoints) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return {
          ready: false,
          error: `${endpoint} returned ${res.status}${body ? `: ${body}` : ''}`,
        };
      }
    } catch (err) {
      // Hide verbose network errors from users in UI
      let message = 'Network error';
      if (err instanceof Error) {
        if (err.message && !err.message.toLowerCase().includes('networkerror')) {
          // if it's not just a generic network error, include trimmed message
          message = err.message;
        }
      } else {
        message = String(err);
      }

      return {
        ready: false,
        error: `${endpoint} check failed: ${message}`,
      };
    }
  }

  return { ready: true };
}
