export interface ProjectStats {
  L1_count: number;
  L2_count: number;
  L3_count: number;
  total_projects: number;
}

export interface Developer {
  // original naming
  dev_id?: string;
  dev_name?: string;

  // alternative naming used by some endpoints
  id?: string;
  name?: string;
  username?: string;

  bio?: string;

  // services/roles interchange
  services?: string[];
  roles?: string[];

  profile_photo?: string;
  avatar_url?: string;

  dev_type?: string;
  years_of_experience?: number;

  skill_tags?: string[];
  tech_stack?: string[];

  project_stats?: ProjectStats;
  stars?: number; // total stars across projects (optional)
  total_stars?: number; // alternative name returned by backend

  selected_level_count?: number; // Count of projects at selected complexity level(s)

  // hiring-signal metrics (may be returned by founder/search)
  complexity_counts?: { L1: number; L2: number; L3: number };
  verified_projects?: number;
  contribution_breakdown?: Record<string, number>;
  average_confidence?: number;
  experience_signal?: string; // Junior/Intermediate/Senior etc.
}

export interface DeveloperSearchResponse {
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  developers: Developer[];
}
export interface DeveloperSearchFilters {
  service?: string;
  role?: string; // alias for service
  technologies?: string[];
  complexity_levels?: string[]; // ["L1", "L2", "L3"]
  complexity_filter?: 'L2+' | 'L3';
  min_verified_projects?: number;
  // minimum number of projects at the selected complexity level
  min_selected_level_count?: number;
  contribution_level?: 'Primary Builder' | 'Major Contributor' | 'Minor Contributor';
  q?: string; // free-text search
  sort_by?: 'full_name' | 'project_count' | 'created_at';
  sort_order?: 1 | -1;
  page?: number;
  limit?: number;
}
