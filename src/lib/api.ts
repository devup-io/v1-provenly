import type { DeveloperProfile, Repo, GitHubAuthorizeResponse, GitHubStatusResponse, Project, AIEvaluation, AggregateEvaluation, GitHubOrganization, V1ImportAllResponse, SupportedDevTypes, SupportedDevTypesResponse, UserSettings, DeveloperFullDetailsResponse, ProjectEvaluationLog, HireDeveloperPayload, DevTypesResponse, DevTypesLanguagesResponse, DeveloperAnalyzerChartsResponse, NotificationItem, NotificationsResponse } from "@/types/api";
import type { DeveloperSearchResponse, DeveloperSearchFilters } from "@/types/developer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.provenly.live";
const DEVELOPER_KEY = "v1_developer";
const OAUTH_STATE_KEY = "v1_oauth_state";
const LEGACY_AUTH_STORAGE_KEYS = [
  'v1_access_token',
  'access_token',
  'auth_token',
  'token',
  'jwt',
  'bearer_token',
];

let hasClearedLegacyAuthStorage = false;

export class ApiError extends Error {
  status: number;
  details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const extractBackendErrorMessage = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidates = [record.detail, record.message, record.error, record.error_description];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return null;
};

const mapStatusToMessage = (status: number, fallback?: string | null): string => {
  switch (status) {
    case 400:
      return fallback || 'We could not process that request. Please review your input and try again.';
    case 401:
    case 403:
      return 'Your session has expired. Please sign in again.';
    case 404:
      return fallback || 'We could not find the requested resource.';
    case 409:
      return fallback || 'This request could not be completed because the data changed. Please refresh and try again.';
    case 422:
      return fallback || 'Some information is invalid. Please review your input and try again.';
    case 429:
      return 'You have made too many requests in a short time. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Our service is temporarily unavailable. Please try again in a few minutes.';
    default:
      return fallback || `Request failed with status ${status}`;
  }
};

const buildApiError = async (res: Response): Promise<ApiError> => {
  const rawText = await res.text().catch(() => '');

  let parsed: unknown = rawText;
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = rawText;
    }
  }

  const backendMessage = extractBackendErrorMessage(parsed);
  return new ApiError(res.status, mapStatusToMessage(res.status, backendMessage), backendMessage || rawText || undefined);
};

const handleGlobalAuthFailure = (): void => {
  clearAuth();

  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  const authRelatedPath =
    currentPath.startsWith('/signup') ||
    currentPath.startsWith('/auth/callback') ||
    currentPath.startsWith('/oauth-loading');

  const protectedPath =
    currentPath.startsWith('/dashboard') ||
    currentPath.startsWith('/settings') ||
    currentPath.startsWith('/analysis') ||
    currentPath.startsWith('/welcome') ||
    currentPath.startsWith('/onboarding') ||
    currentPath.startsWith('/profile-setup');

  if (!authRelatedPath && protectedPath) {
    window.location.replace('/signup?error=session_expired');
  }
};

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }

  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return normalized.includes('401') || normalized.includes('403') || normalized.includes('unauthorized') || normalized.includes('session expired');
};

export const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 429;
  }

  const message = error instanceof Error ? error.message : String(error);
  return message.includes('429') || message.toLowerCase().includes('too many requests');
};

export const isServiceUnavailableError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return [500, 502, 503, 504].includes(error.status);
  }

  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return ['500', '502', '503', '504'].some((code) => normalized.includes(code)) || normalized.includes('service unavailable') || normalized.includes('database');
};

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
  
  return transformed;
}

// Transform backend aggregate evaluation to frontend type
function transformBackendAggregateEvaluation(raw: Record<string, unknown>): AggregateEvaluation {
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

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      credentials: 'include',
      mode: 'cors',
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      ...rest,
    });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? 'Unable to reach the server. Please check your connection and try again.'
      : 'Unable to complete the request. Please try again.';
    throw new ApiError(0, message);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      handleGlobalAuthFailure();
    }
    throw await buildApiError(res);
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
      throw new Error('Cannot connect to backend. Make sure the backend server is running at https://api.provenly.live and CORS is configured.');
    }
    throw err;
  }
}

export async function getGitHubStatus(state: string): Promise<GitHubStatusResponse> {
  return apiRequest<GitHubStatusResponse>(`/api/v1/auth/github/status?state=${encodeURIComponent(state)}`, {
    method: "GET",
  });
}

export async function refreshAuthSession(): Promise<void> {
  await apiRequest<void>("/api/v1/auth/refresh", {
    method: "POST",
    expectJson: false,
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
  // Retry logic: cookie may not be set immediately after OAuth redirect
  let lastError: Error | null = null;
  const maxRetries = 3;
  const delays = [500, 1000, 2000]; // ms between retries

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await apiRequest<void>(url, {
        method: "POST",
        expectJson: false,
        body: selectedRepoNames ? JSON.stringify({ selected_repos: selectedRepoNames }) : undefined,
      });
      return; // Success!
    } catch (err) {
      lastError = err as Error;
      if (!(err instanceof Error) || !err.message.includes('401')) {
        // Non-auth error, don't retry
        throw err;
      }
      
      if (attempt < maxRetries) {
        const delay = delays[attempt - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted with 401
  if (lastError) {
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

export function clearLegacyAuthStorageKeysOnce() {
  if (hasClearedLegacyAuthStorage) return;
  hasClearedLegacyAuthStorage = true;

  if (typeof window === 'undefined') return;

  try {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export async function postGitHubCallback(code: string, state: string): Promise<void> {
  await apiRequest<void>("/api/v1/auth/github/callback", {
    method: "POST",
    body: JSON.stringify({ code, state }),
    expectJson: false,
  });
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
    sessionStorage.removeItem('v1_access_token');
    localStorage.removeItem('v1_access_token');
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
  const data = await apiRequest<DeveloperProfile>("/api/v1/me", {
    method: "GET",
  });

  saveDeveloper(data);
  return data;
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

    return (data.organizations || []).map((org) => ({
      id: org.id,
      login: org.login,
      avatar_url: org.avatar_url,
      description: org.description,
    }));
  } catch {
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

    const data = await apiRequest<BackendImportListResponse>(
      `/api/v1/projects/import-all?${params.toString()}`,
      {
        method: "POST",
      }
    );

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
  } catch {
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

  return apiRequest<BackendImportResponse>(
    "/api/v1/projects/repositories/submit?evaluate_ai=true",
    {
      method: "POST",
      body: JSON.stringify({
        selected_repos: repoFullNames,
      }),
    }
  );
}

// fetch available repositories for import, including AI metadata
export async function fetchAvailableRepos(ownerLogin: string, limit = 100, includeOrganizations: boolean | null = null): Promise<V1ImportAllResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    org_or_user: ownerLogin,
  });
  // default behaviour: server already infers from settings if available,
  // but we can override by providing flag
  if (includeOrganizations !== null) {
    params.set('include_organizations', includeOrganizations ? 'true' : 'false');
  }
  return apiRequest<V1ImportAllResponse>(
    `/api/v1/projects/repositories/available?${params.toString()}`,
    { method: "GET" }
  );
}

// supported developer types (legacy endpoint)
export async function getSupportedDevTypes(): Promise<SupportedDevTypes> {
  try {
    const data = await getSupportedDevTypesConfig();
    return data.supported_dev_types || [];
  } catch {
    return [];
  }
}

export async function getSupportedDevTypesConfig(): Promise<SupportedDevTypesResponse> {
  const raw = await apiRequest<unknown>("/api/v1/projects/supported-dev-types", {
    method: "GET",
  });

  if (Array.isArray(raw)) {
    return {
      supported_dev_types: raw.filter((item): item is string => typeof item === 'string'),
      signal_order: ["repo_score", "architecture_score", "code_quality_score", "engineering_depth_score"],
      project_type_config: {},
      tech_stack_by_dev_type: {},
    };
  }

  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  return {
    supported_dev_types: Array.isArray(record.supported_dev_types)
      ? record.supported_dev_types.filter((item): item is string => typeof item === 'string')
      : [],
    signal_order: Array.isArray(record.signal_order)
      ? record.signal_order.filter((item): item is SupportedDevTypesResponse['signal_order'][number] => typeof item === 'string')
      : ["repo_score", "architecture_score", "code_quality_score", "engineering_depth_score"],
    project_type_config:
      record.project_type_config && typeof record.project_type_config === 'object'
        ? (record.project_type_config as SupportedDevTypesResponse['project_type_config'])
        : {},
    tech_stack_by_dev_type:
      record.tech_stack_by_dev_type && typeof record.tech_stack_by_dev_type === 'object'
        ? (record.tech_stack_by_dev_type as SupportedDevTypesResponse['tech_stack_by_dev_type'])
        : {},
  };
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
  const path = `/api/v1/developers/${encodeURIComponent(developerId)}/analyzer`;

  try {
    return await apiRequest<unknown>(path, {
      method: 'POST',
    });
  } catch (error) {
    if (error instanceof ApiError && [404, 405].includes(error.status)) {
      return apiRequest<unknown>(path, {
        method: 'GET',
      });
    }
    throw error;
  }
}

export async function evaluateProjectAI(projectId: string): Promise<void> {
  await apiRequest<void>(`/api/v1/projects/${encodeURIComponent(projectId)}/evaluate-ai`, {
    method: 'POST',
    expectJson: false,
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
    } catch {
      // Ignore malformed stream events.
    }
  });

  source.addEventListener('complete', (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent).data);
      handlers.onComplete(payload);
    } catch {
      // Ignore malformed stream events.
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
  return apiRequest(`/api/v1/projects/evaluations/aggregate`, {
    method: "GET",
  });
}

// Project & Evaluation Functions

export async function getDeveloperProjects(userId?: string): Promise<Project[]> {
  // userId parameter is kept for backward compatibility but not used
  const endpoint = `/api/v1/my-projects`;
  const data = await apiRequest<Record<string, unknown>[]>(endpoint, {
    method: "GET",
  });

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((project) => transformBackendProject(project));
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

  const query = params.toString();
  const path = query ? `/api/v1/search/founders?${query}` : '/api/v1/search/founders';
  const dataRaw = await apiRequest<Record<string, unknown>>(path, {
    method: 'GET',
  });

  const data = dataRaw || {};
  const results = Array.isArray(data.results) ? data.results : [];
  const founders = Array.isArray(data.founders) ? data.founders : [];
  const developers = Array.isArray(data.developers)
    ? data.developers
    : (results.length > 0 ? results : founders);

  return {
    ...data,
    developers,
  } as DeveloperSearchResponse;
}

export async function getProjectEvaluation(projectId: string): Promise<AIEvaluation> {
  return apiRequest<AIEvaluation>(`/api/v1/projects/${encodeURIComponent(projectId)}/evaluation`, {
    method: "GET",
  });
}

export async function getAggregateEvaluation(userId?: string): Promise<AggregateEvaluation> {
  // userId parameter is kept for backward compatibility but not used
  const endpoint = `/api/v1/my-aggregate-evaluation`;
  const data = await apiRequest<Record<string, unknown>>(endpoint, {
    method: "GET",
  });

  return transformBackendAggregateEvaluation(data);
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
  } catch {
    return {} as UserSettings;
  }
}

export async function patchUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  return apiRequest<UserSettings>(`/api/v1/me/settings`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

/**
 * Refresh project data after user commits new code
 * This re-evaluates the project with latest GitHub data
 */
export async function refreshProjectData(projectId: string): Promise<Project> {
  const data = await apiRequest<Record<string, unknown>>(`/api/v1/projects/${encodeURIComponent(projectId)}/refresh`, {
    method: "POST",
  });

  return transformBackendProject(data);
}

export async function getProjectEvaluationLogs(projectId: string): Promise<ProjectEvaluationLog[]> {
  const data = await apiRequest<ProjectEvaluationLog[]>(`/api/v1/projects/${encodeURIComponent(projectId)}/evaluation-logs`, {
    method: 'GET',
  });
  return Array.isArray(data) ? data : [];
}

export async function submitHireRequest(developerId: string, payload: HireDeveloperPayload): Promise<{ status?: string; message?: string }> {
  const normalizedPayload: HireDeveloperPayload = {
    ...payload,
    founder_name: payload.founder_name || payload.name,
    founder_email: payload.founder_email || payload.email,
    name: payload.name || payload.founder_name,
    email: payload.email || payload.founder_email,
  };

  try {
    return await apiRequest<{ status?: string; message?: string }>(`/api/v1/developers/${encodeURIComponent(developerId)}/hire`, {
      method: 'POST',
      body: JSON.stringify(normalizedPayload),
    });
  } catch (primaryErr) {
    try {
      return await apiRequest<{ status?: string; message?: string }>(`/api/v1/hiring/inquiries`, {
        method: 'POST',
        body: JSON.stringify({ developer_id: developerId, ...normalizedPayload }),
      });
    } catch {
      throw primaryErr;
    }
  }
}

export async function getMyNotifications(options: { limit?: number; unreadOnly?: boolean } = {}): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.unreadOnly !== undefined) params.set('unread_only', options.unreadOnly ? 'true' : 'false');

  const query = params.toString();
  const path = query ? `/api/v1/me/notifications?${query}` : '/api/v1/me/notifications';
  const raw = await apiRequest<unknown>(path, { method: 'GET' });

  const normalizeItem = (item: unknown): NotificationItem | null => {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? row._id ?? '');
    const message = typeof row.message === 'string'
      ? row.message
      : typeof row.body === 'string'
      ? row.body
      : typeof row.text === 'string'
      ? row.text
      : '';
    if (!id || !message) return null;

    return {
      id,
      title: typeof row.title === 'string' ? row.title : undefined,
      message,
      type: typeof row.type === 'string' ? row.type : undefined,
      is_read: Boolean(row.is_read ?? row.read ?? false),
      created_at:
        typeof row.created_at === 'string'
          ? row.created_at
          : typeof row.createdAt === 'string'
          ? row.createdAt
          : new Date().toISOString(),
      metadata:
        row.metadata && typeof row.metadata === 'object'
          ? (row.metadata as Record<string, unknown>)
          : undefined,
    };
  };

  let notifications: NotificationItem[] = [];
  let unreadCount = 0;

  if (Array.isArray(raw)) {
    notifications = raw.map(normalizeItem).filter((entry): entry is NotificationItem => Boolean(entry));
  } else if (raw && typeof raw === 'object') {
    const payload = raw as Record<string, unknown>;
    const sourceList = Array.isArray(payload.notifications)
      ? payload.notifications
      : Array.isArray(payload.items)
      ? payload.items
      : [];

    notifications = sourceList.map(normalizeItem).filter((entry): entry is NotificationItem => Boolean(entry));
    unreadCount = typeof payload.unread_count === 'number' ? payload.unread_count : 0;
  }

  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (!unreadCount) {
    unreadCount = notifications.filter((item) => !item.is_read).length;
  }

  return {
    notifications,
    unread_count: unreadCount,
  };
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await apiRequest<void>(`/api/v1/me/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
    expectJson: false,
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest<void>('/api/v1/me/notifications/read-all', {
    method: 'POST',
    expectJson: false,
  });
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
