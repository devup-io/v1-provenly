import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Github,
  Star,
  GitBranch,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Mail,
  Linkedin,
  Calendar,
  Code2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";import { Progress } from '@/components/ui/progress';import { ErrorScreen } from "@/components/ErrorScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/landing/Header";
import { HireModal } from "@/components/HireModal";
import { getDeveloper, getDeveloperById, getDeveloperByUsername, getDeveloperFullDetails, submitHireRequest, isRateLimitError, isServiceUnavailableError } from "@/lib/api";
import type { AIEvaluation, DeveloperProfile, Project as ApiProject, DeveloperFullDetailsProject } from "@/types/api";

// extend the API project type with any local extras we display
type Project = ApiProject & {
  problem?: string;
  contribution?: string;
  techUsed?: string[];
  warnings?: string[]; // new backend warnings
  repo_full_name?: string;
  primary_language?: string | null;
  top_languages?: string[];
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
};

type DevFull = DeveloperProfile & {
  username?: string;
  avatarUrl?: string;
  projects?: Project[];
  roles?: string[];
  techStack?: string[];
  maxComplexity?: string;
  totalStars?: number;
  projectCount?: number;
  complexityCounts?: Record<string, number>;
  bio?: string | null;
  suspicious_flags?: string[];
  is_suspended?: boolean;
  suspended_at?: string | Date | null;
};

function normalizeComplexityLevel(value?: unknown): 'L1' | 'L2' | 'L3' | undefined {
  if (!value) return undefined;
  const normalized = typeof value === 'string' ? value.toLowerCase() : JSON.stringify(value).toLowerCase();
  if (normalized.includes('l1') || normalized.includes('beginner') || normalized.includes('low')) return 'L1';
  if (normalized.includes('l2') || normalized.includes('intermediate') || normalized.includes('medium') || normalized.includes('mid')) return 'L2';
  if (normalized.includes('l3') || normalized.includes('advanced') || normalized.includes('high') || normalized.includes('expert')) return 'L3';
  return undefined;
}

function formatDate(value?: string | Date): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function mapFullDetailsProject(raw: DeveloperFullDetailsProject, developerId: string): Project {
  const normalizedComplexity = normalizeComplexityLevel(raw.complexity) || 'L1';
  const difficultyTier =
    raw.difficulty_tier ||
    (normalizedComplexity === 'L1'
      ? 'Beginner'
      : normalizedComplexity === 'L2'
      ? 'Intermediate'
      : 'Advanced');

  const aiEvaluation: AIEvaluation = {
    id: raw.id,
    project_id: raw.id,
    developer_id: developerId,
    ai_status: 'completed',
    difficulty_tier: difficultyTier as AIEvaluation['difficulty_tier'],
    repo_score: raw.repo_score,
    estimated_developer_level: raw.estimated_developer_level as AIEvaluation['estimated_developer_level'],
    primary_role_alignment: raw.primary_role_alignment as AIEvaluation['primary_role_alignment'],
    summary: raw.summary,
    contribution_percentage: raw.contribution_percentage,
    confidence_score: raw.confidence_score,
    detected_project_type: raw.detected_project_type,
    evaluation_profile: raw.evaluation_profile,
    role_mismatch: raw.role_mismatch,
    role_mismatch_note: raw.role_mismatch_note,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };

  return {
    id: raw.id,
    developer_id: developerId,
    name: raw.name,
    description: raw.description,
    complexity: normalizedComplexity,
    language: raw.primary_language ?? raw.languages?.[0] ?? null,
    primary_language: raw.primary_language ?? raw.languages?.[0] ?? null,
    top_languages: raw.top_languages ?? raw.languages,
    primary_stack: raw.top_languages ?? raw.languages,
    stars: raw.stars,
    forks: raw.forks,
    url: raw.repo_url ?? raw.url,
    github_url: raw.repo_url ?? raw.url,
    repo_full_name: raw.repo_full_name,
    warnings: raw.warnings,
    status: raw.status,
    created_at: raw.created_at ?? raw.imported_at,
    updated_at: raw.updated_at ?? raw.imported_at,
    ai_evaluation: aiEvaluation,
  };
}

const complexityColors: Record<string, string> = {
  L1: "bg-pastel-mint text-pastel-mint-foreground",
  L2: "bg-pastel-yellow text-pastel-yellow-foreground",
  L3: "bg-pastel-peach text-pastel-peach-foreground",
};

export default function DeveloperProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [developer, setDeveloper] = useState<DevFull | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!username) {
          if (!cancelled) {
            setError('Invalid developer identifier');
            setErrorStatusCode('404');
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        setError(null);
        setErrorStatusCode(null);

        const local = getDeveloper();
        let resolvedDeveloper: DeveloperProfile | null = null;

        if (local && (username === local.github_username || username === local.id)) {
          resolvedDeveloper = local;
        } else {
          try {
            resolvedDeveloper = await getDeveloperByUsername(username);
          } catch {
            resolvedDeveloper = await getDeveloperById(username);
          }
        }

        const fullDetails = await getDeveloperFullDetails(resolvedDeveloper.id);
        const mappedProjects = (fullDetails.projects || []).map((project) => mapFullDetailsProject(project, fullDetails.profile.id));

        const normalizedLevels = mappedProjects
          .map((project) => normalizeComplexityLevel(project.complexity))
          .filter((level): level is 'L1' | 'L2' | 'L3' => Boolean(level));

        const maxComplexity = normalizedLevels.includes('L3')
          ? 'L3'
          : normalizedLevels.includes('L2')
          ? 'L2'
          : normalizedLevels.includes('L1')
          ? 'L1'
          : undefined;

        const recommendedRoles = fullDetails.summary?.recommended_for_roles || [];
        const roleFallback = fullDetails.profile.primary_role ? [fullDetails.profile.primary_role] : [];
        const techStack = Object.keys(fullDetails.aggregate?.tech_stack_summary || {});

        const mergedDeveloper: DevFull = {
          ...fullDetails.profile,
          username: fullDetails.profile.github_username,
          avatarUrl: fullDetails.profile.github_avatar || undefined,
          roles: recommendedRoles.length > 0 ? recommendedRoles : roleFallback,
          techStack: techStack.length > 0 ? techStack : (fullDetails.profile.primary_stack || []),
          projectCount: fullDetails.aggregate?.total_projects ?? mappedProjects.length,
          totalStars: mappedProjects.reduce((sum, project) => sum + (project.stars || 0), 0),
          maxComplexity,
        };

        if (!cancelled) {
          setDeveloper(mergedDeveloper);
          setProjects(mappedProjects);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          const isUnavailable = isServiceUnavailableError(e);
          const isRateLimited = isRateLimitError(e);
          setDeveloper(null);
          setProjects([]);
          setErrorStatusCode(isUnavailable ? '503' : isRateLimited ? '429' : '500');
          setError(
            isUnavailable
              ? 'Developer profiles are temporarily unavailable.'
              : isRateLimited
              ? 'Too many requests. Please wait briefly and retry.'
              : 'Failed to load developer profile.'
          );
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container max-w-4xl px-4 py-8 sm:px-6">
          {/* Back button skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Header section skeleton */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row">
            <Skeleton className="h-32 w-32 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-12 w-40 flex-shrink-0" />
          </div>

          {/* Bio section skeleton */}
          <div className="mb-8 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Tech stack skeleton */}
          <div className="mb-8">
            <Skeleton className="mb-3 h-6 w-40" />
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>

          {/* Projects section skeleton */}
          <div className="mb-8">
            <Skeleton className="mb-4 h-8 w-48" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <Skeleton className="mb-3 h-6 w-64" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (errorStatusCode === '503') {
      return (
        <ErrorScreen
          statusCode="503"
          title="Developer profile is temporarily unavailable"
          subtitle="Our profile data services are currently unavailable."
          message="Please try again in a few moments."
          onRetry={() => window.location.reload()}
          primaryActionLabel="Retry"
        />
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 pt-28 text-center">
          <h1 className="mb-4 text-display-sm">Error loading profile</h1>
          <p className="mb-8 text-body text-destructive">{error}</p>
          <Button onClick={() => { setLoading(true); setError(null); setDeveloper(null); }}>Retry</Button>
        </main>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 pt-28 text-center">
          <h1 className="mb-4 text-display-sm">Developer not found</h1>
          <p className="mb-8 text-body text-muted-foreground">The developer profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/developers')}>Browse developers</Button>
        </main>
      </div>
    );
  }

  const localProfile = getDeveloper();
  const isOwnProfile = Boolean(localProfile && developer && localProfile.id === developer.id);

  const developerProjects: Project[] = projects.length > 0 ? projects : developer.projects || [];
  const complexityCounts = developerProjects.reduce((acc: Record<string, number>, p: Project) => {
    const level = String(p.complexity || "");
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // derive extra metrics
  const totalVerified = developer.verified_projects ?? developerProjects.filter(p => p.ai_evaluation?.verified_badge).length;
  const contributions = developer.contribution_breakdown || developerProjects.reduce((acc: Record<string, number>, p) => {
    if (p.contribution) {
      acc[p.contribution] = (acc[p.contribution] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 pt-28">
        {/* back button and possible alerts */}
        <Button variant="ghost" onClick={() => navigate('/developers')} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to developers
        </Button>
        {isOwnProfile && developer?.suspicious_flags && developer.suspicious_flags.length > 0 && (
          <div className="mb-4 rounded-lg bg-yellow-100 border border-yellow-300 p-4 text-yellow-800">
            ⚠️ Suspicious activity detected: {developer.suspicious_flags.join(', ')}
          </div>
        )}

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <div className="relative mx-auto md:mx-0">
              <img src={developer.github_avatar || developer.avatarUrl} alt={developer.name || developer.github_username} className="h-28 w-28 rounded-2xl object-cover md:h-36 md:w-36" />
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md ring-2 ring-card">
                <Github className="h-5 w-5 text-foreground" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <h1 className="text-display-sm">{developer.name || developer.github_username}</h1>
                <span className={`rounded-lg px-3 py-1 text-body-sm font-bold ${complexityColors[developer.maxComplexity] || ''}`}>
                  Max {developer.maxComplexity || '—'}
                </span>
              </div>
              <p className="mb-3 text-body text-muted-foreground">@{developer.github_username || developer.username}</p>
              <p className="mb-4 max-w-2xl text-body text-muted-foreground">{developer.bio}</p>

              <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {(developer.roles || []).map((role: string) => (
                  <span key={role} className="rounded-full bg-secondary px-3 py-1.5 text-body-sm">{role}</span>
                ))}
              </div>

              <div className="mb-4 grid grid-cols-1 gap-2 text-body-sm sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Experience</p>
                  <p className="font-medium">{developer.experience_signal || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Verified Projects</p>
                  <p className="font-medium">{totalVerified ?? 0}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Avg Confidence</p>
                  <p className="font-medium">
                    {developer.average_confidence !== undefined ? `${Math.round(developer.average_confidence)}%` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Projects</p>
                  <p className="font-medium">{developer.projectCount ?? developerProjects.length ?? 0}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Total Stars</p>
                  <p className="font-medium">{developer.totalStars ?? 0}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-caption text-muted-foreground">Top Complexity</p>
                  <p className="font-medium">{developer.maxComplexity || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-body-sm text-muted-foreground">
                Contribution: Primary {contributions['Primary Builder'] || 0} | Major {contributions['Major Contributor'] || 0} | Minor {contributions['Minor Contributor'] || 0}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="default" size="lg" className="gap-2" onClick={() => setIsHireModalOpen(true)}>
                <Mail className="h-4 w-4" />
                Hire Me
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats & Tech */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-heading-sm">Complexity breakdown</h3>
            <div className="flex gap-4">
              {['L1', 'L2', 'L3'].map((level) => (
                <div key={level} className="flex-1 text-center">
                  <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl ${complexityColors[level] || ''}`}>
                    <span className="text-lg font-bold">{complexityCounts[level] || 0}</span>
                  </div>
                  <p className="text-caption text-muted-foreground">{level} projects</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 text-heading-sm">Tech stack</h3>
            <div className="flex flex-wrap gap-2">{(developer.techStack || []).map((tech: string) => (<span key={tech} className="rounded-full bg-secondary px-3 py-1.5 text-body-sm">{tech}</span>))}</div>
          </motion.div>
        </div>

        {/* Projects */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="mb-6 text-display-sm">Projects ({developerProjects.length})</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {developerProjects.map((project: Project, index: number) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + index * 0.05 }} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
                {(() => {
                  const owner = project.repo_full_name?.split('/')[0]?.toLowerCase();
                  const username = developer.github_username?.toLowerCase();
                  const isOrganizationRepo = Boolean(owner && username && owner !== username);
                  const hasVeryLowContribution = isOrganizationRepo && (project.commits_count ?? 0) <= 2;

                  if (!hasVeryLowContribution) return null;

                  return (
                    <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-100 px-3 py-2 text-caption text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
                      Basic contribution detected on this organization repository: visible commit activity appears very limited.
                    </div>
                  );
                })()}

                {project.warnings && project.warnings.length > 0 && (
                  <div className="mb-2 text-caption text-yellow-800">
                    ⚠️ {project.warnings.join(', ')}
                  </div>
                  )}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-heading">{project.name}</h3>
                      <span className={`rounded-lg px-2.5 py-1 text-caption font-bold ${complexityColors[String(project.complexity)] || ''}`}>{String(project.complexity)}</span>
                    </div>
                    {project.repo_full_name && (
                      <div className="mb-2 text-caption text-muted-foreground">{project.repo_full_name}</div>
                    )}
                    <p className="text-body text-muted-foreground">{project.description}</p>
                    {(project.language || project.top_languages?.length) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {project.language && (
                          <span className="rounded-full bg-secondary/40 px-3 py-1 text-body-sm">{project.language}</span>
                        )}
                        {project.top_languages?.map((lang) => (
                          <span key={lang} className="rounded-full bg-secondary/20 px-3 py-1 text-body-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      View on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-2 text-body-sm sm:grid-cols-4">
                  <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-center">
                    <p className="text-caption text-muted-foreground">Stars</p>
                    <p className="font-semibold">{project.stars ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-center">
                    <p className="text-caption text-muted-foreground">Forks</p>
                    <p className="font-semibold">{project.forks ?? 0}</p>
                  </div>
                  {project.ai_evaluation?.repo_score != null && (
                    <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-center">
                      <p className="text-caption text-muted-foreground">Score</p>
                      <p className="font-semibold">{project.ai_evaluation.repo_score}</p>
                    </div>
                  )}
                  {project.ai_evaluation?.confidence_score != null && (
                    <div className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-center">
                      <p className="text-caption text-muted-foreground">Confidence</p>
                      <p className="font-semibold">{project.ai_evaluation.confidence_score}%</p>
                    </div>
                  )}
                </div>

                {project.ai_evaluation?.confidence_score != null && (
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-caption text-muted-foreground">
                      <span>Confidence</span>
                      <span className="font-medium">{project.ai_evaluation.confidence_score}%</span>
                    </div>
                    <Progress value={project.ai_evaluation.confidence_score} className="h-1.5" />
                  </div>
                )}

                {project.ai_evaluation?.contribution_percentage != null && (
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-caption text-muted-foreground">
                      <span>Contribution</span>
                      <span className="font-medium">{project.ai_evaluation.contribution_percentage}%</span>
                    </div>
                    <Progress value={project.ai_evaluation.contribution_percentage} className="h-1.5 [&>div]:bg-emerald-500" />
                  </div>
                )}

                {/* AI evaluation summary */}
                {project.ai_evaluation && (
                  <div className="mb-4 space-y-2 text-body-sm">
                    {(project.ai_evaluation.summary || project.ai_evaluation.overall_assessment) && (
                      <div>
                        <span className="font-medium">AI summary:</span>{' '}
                        <span>{project.ai_evaluation.summary || project.ai_evaluation.overall_assessment}</span>
                      </div>
                    )}
                    {project.ai_evaluation.difficulty_tier && (
                      <div>Complexity: {project.ai_evaluation.difficulty_tier}</div>
                    )}
                    {project.ai_evaluation.estimated_developer_level && (
                      <div>Developer level: {project.ai_evaluation.estimated_developer_level}</div>
                    )}
                    {project.ai_evaluation.primary_role_alignment && (
                      <div>Role alignment: {project.ai_evaluation.primary_role_alignment}</div>
                    )}
                    {project.ai_evaluation.detected_project_type && (
                      <div>Detected type: {project.ai_evaluation.detected_project_type}</div>
                    )}
                    {project.ai_evaluation.evaluation_profile && (
                      <div>Profile: {project.ai_evaluation.evaluation_profile}</div>
                    )}
                    {project.ai_evaluation.role_mismatch && (
                      <div className="mt-1 rounded-md bg-yellow-100 p-2 text-yellow-800">
                        {project.ai_evaluation.role_mismatch_note || 'Role mismatch detected.'}
                      </div>
                    )}
                    {(project.created_at || project.updated_at) && (
                      <div className="text-caption text-muted-foreground">
                        {project.created_at && `Created: ${formatDate(project.created_at)}`}
                        {project.created_at && project.updated_at && ' • '}
                        {project.updated_at && `Updated: ${formatDate(project.updated_at)}`}
                      </div>
                    )}
                  </div>
                )}

                {((project.ai_evaluation?.detected_project_type === 'Unsupported') || (project.ai_evaluation?.evaluation_profile === 'Unsupported')) && (
                  <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive">
                    This repository appears to be a type we do not currently support; the evaluation is generic and will not strengthen any profile role.
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-body-sm font-semibold"><Code2 className="h-4 w-4 text-primary" /> Problem solved</h4>
                    <p className="text-body-sm text-muted-foreground">{project.problem}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-body-sm font-semibold"><Code2 className="h-4 w-4 text-primary" /> Personal contribution</h4>
                    <p className="text-body-sm text-muted-foreground">{project.contribution}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-2">{(project.techUsed || []).map((tech: string) => (<span key={tech} className="rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground">{tech}</span>))}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <HireModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        developerName={developer.name || developer.github_username || 'Developer'}
        developerUsername={developer.username || developer.github_username || ''}
        onSubmit={async (payload) => {
          await submitHireRequest(developer.id, payload);
        }}
      />
    </div>
  );
}
