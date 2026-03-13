export interface DeveloperProfile {
  id: string;
  github_id: number | string;
  github_username: string;
  github_avatar?: string | null;
  avatar_url?: string | null;
  name?: string | null;
  primary_role?: string | null;
  years_of_experience?: number | null;
  primary_stack?: string[];
  bio?: string | null;
  profile_complete?: boolean;
  // hiring signals added by the backend
  verified_projects?: number;
  average_confidence?: number;
  experience_signal?: string;
  contribution_breakdown?: Record<string, number>;
  // some endpoints may include projects directly
  projects?: Project[];
  is_published?: boolean; // indicates whether the profile has been published
  created_at?: string | Date;
  updated_at?: string | Date;

  // new fields from backend
  suspicious_flags?: string[];
  is_suspended?: boolean;
  suspended_at?: string | Date;
}

export interface V1AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  developer: DeveloperProfile;
}

export interface Repo {
  id: string;
  name: string;
  language?: string | null;
  stars: number;
  forks: number;
  commits_count?: number;
  lastUpdated: string; // ISO date string
  description?: string | null;
  url?: string;
  owner?: string; // organization or user login
  full_name?: string; // owner/repo_name for import
  already_imported?: boolean; // true if already in user's profile
  // new AI evaluation / import metadata
  difficulty_tier?: string;
  primary_role_alignment?: string;
  detected_project_type?: string;
  evaluation_profile?: string;
  role_mismatch?: boolean;
  role_mismatch_note?: string;
  import_status?: "available" | "queued" | "completed" | "failed";
  import_failure_reason?: string;
}

// response formats for repo listing
export interface V1ImportAllResponse {
  target: string;
  total_repos_found: number;
  message: string;
  queue_threshold?: number;
  import_results: Array<{
    repo_name: string;
    status: "available" | "already_imported" | "unsupported";
    repo_id: string;
    metadata: {
      url: string;
      language?: string | null;
      stars?: number;
      forks?: number;
      description?: string | null;
      full_name: string;
      clone_url?: string;
      difficulty_tier?: string;
      primary_role_alignment?: string;
      detected_project_type?: string;
      evaluation_profile?: string;
      role_mismatch?: boolean;
      role_mismatch_note?: string;
    };
    ai_fields?: Record<string, unknown>;
  }>;
}

export interface DeveloperFullDetailsProject {
  id: string;
  name: string;
  description?: string | null;
  complexity?: string;
  languages?: string[];
  stars?: number;
  forks?: number;
  url?: string;
  repo_url?: string;
  repo_full_name?: string;
  primary_language?: string | null;
  top_languages?: string[];
  difficulty_tier?: string;
  repo_score?: number;
  estimated_developer_level?: string;
  primary_role_alignment?: string;
  summary?: string;
  contribution_percentage?: number;
  confidence_score?: number;
  detected_project_type?: string;
  evaluation_profile?: string;
  role_mismatch?: boolean;
  role_mismatch_note?: string;
  created_at?: string;
  updated_at?: string;
  imported_at?: string;
  status?: string;
  warnings?: string[];
}

export interface DeveloperFullDetailsAggregate {
  total_projects?: number;
  avg_complexity?: number;
  tech_stack_summary?: Record<string, number>;
  avg_project_score?: number;
  developer_quality?: string;
  years_of_experience?: string;
}

export interface DeveloperFullDetailsSummary {
  profile_completeness_score?: number;
  hiring_signal?: string;
  recommended_for_roles?: string[];
  tech_specialization?: string;
  reliability_score?: number;
  last_updated?: string;
}

export interface DeveloperFullDetailsResponse {
  profile: DeveloperProfile;
  projects: DeveloperFullDetailsProject[];
  aggregate?: DeveloperFullDetailsAggregate;
  summary?: DeveloperFullDetailsSummary;
}

export interface ProjectEvaluationLog {
  id: string;
  project_id: string;
  developer_id: string;
  trigger?: string;
  status: string;
  source?: string;
  detail?: string | null;
  created_at: string;
}

export interface HireDeveloperPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export type SupportedDevTypes = string[];

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  description?: string | null;
}

export interface GitHubAuthorizeResponse {
  authorization_url: string;
  state: string;
}

export type GitHubOAuthStatus = 
  | "connecting" 
  | "verifying" 
  | "fetching_repositories" 
  | "finalizing" 
  | "completed" 
  | "error";

export interface GitHubStatusResponse {
  status: GitHubOAuthStatus;
  status_message: string;
  status_logs?: string[]; // timeline messages from backend
  error?: string;
}

export type AIEvalStatus = "pending" | "completed" | "failed";

export interface AIEvaluation {
  id: string;
  project_id: string;
  developer_id: string;
  ai_status: AIEvalStatus;
  difficulty_tier?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  overall_assessment?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];

  // Contribution analysis
  contribution_percentage?: number; // 0-100
  contribution_level?: "Primary Builder" | "Major Contributor" | "Minor Contributor";
  developer_commit_count?: number;
  total_repo_commits?: number;
  pr_count?: number;

  // Confidence score components
  commit_frequency_signal?: "healthy" | "irregular" | "suspicious";
  commit_distribution_signal?: string; // natural vs dumped description
  development_timeline_signal?: string; // sustained vs sporadic
  confidence_level?: "High" | "Medium" | "Low";
  confidence_score?: number; // 0-100

  // Verified badge
  verified_badge?: boolean;

  // Score breakdown (0-100)
  repo_score?: number;
  engineering_depth_score?: number;
  architecture_score?: number;
  code_quality_score?: number;
  production_readiness_score?: number;
  commit_quality_score?: number;
  estimated_developer_level?: "Junior" | "Mid-level" | "Senior" | "Lead/Staff";
  primary_role_alignment?: "Backend" | "Frontend" | "Full-stack" | "DevOps";
  summary?: string;

  // new fields for role-aware evaluation
  detected_project_type?: string;
  evaluation_profile?: string;
  role_mismatch?: boolean;
  role_mismatch_note?: string;

  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  developer_id: string;
  name: string;
  description?: string | null;
  url?: string;
  github_url?: string;
  language?: string | null;
  stars?: number;
  forks?: number;
  commits_count?: number;
  contributors_count?: number;
  last_updated?: string;
  // project-level contribution info added by backend
  contribution_level?: "Primary Builder" | "Major Contributor" | "Minor Contributor";
  verified_badge?: boolean;
  // difficulty/complexity level; sometimes string ("L2" etc) or object with more data
  complexity?: string | Record<string, unknown>;

  // raw objects - useful for debugging or advanced displays
  github_metadata?: Record<string, unknown>;
  commit_metrics?: Record<string, unknown>;

  // evaluation and status information
  ai_evaluation?: AIEvaluation;
  evaluation_status?: "completed" | "pending" | "unavailable" | "not_requested";
  status?: string;
  analyzed_at?: string;

  // primary technology stack inferred by backend or user edits
  primary_stack?: string[];

  // warnings generated during import/refresh
  warnings?: string[];

  // engineering signals for additional insights
  engineering_signals?: Record<string, unknown>;
  repository_quality?: number;
  collaborative_development?: number;

  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  include_org_repos?: boolean;
  import_queue_threshold?: number;
  run_ai_by_default?: boolean;
  auto_publish_on_complete?: boolean;
}

export interface AggregateEvaluation {
  developer_id: string;
  total_projects: number;
  overall_skill_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  difficulty_distribution: Record<string, number>;
  primary_technologies: string[];
  total_commits: number;
  strongest_areas: string[];
  projects: Project[];
  repository_quality?: number;
  collaborative_development?: number;
  // new profiling counts
  evaluation_profile_counts?: Record<string, number>;
  detected_project_type_counts?: Record<string, number>;
  developer_declared_role?: string;
}
