import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Loader2, AlertCircle, RefreshCw, Plus, GitBranch, Check, Cpu, Info, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorScreen } from '@/components/ErrorScreen';
import { Header } from '@/components/landing/Header';
import { useToast } from '@/hooks/use-toast';
import { getDeveloper, getDeveloperProjects, getAggregateEvaluation, clearAuth, getCurrentDeveloper, getSupportedDevTypesConfig, publishProfile, unpublishProfile, getDeveloperAnalyzer, isAuthError, isRateLimitError, isServiceUnavailableError } from '@/lib/api';
import type { DeveloperProfile, Project, AggregateEvaluation, SupportedDevTypesResponse } from '@/types/api';

type ProjectCardShape = {
  highest_complexity?: string;
  dominant_complexity?: string;
  max_complexity?: string;
};

const getLanguageCatalog = (cfg: SupportedDevTypesResponse) =>
  [...new Set(Object.values(cfg.tech_stack_by_dev_type).flat())].sort((a, b) => a.localeCompare(b));

const getComplexityPair = (p: ProjectCardShape) => ({
  highest: p.highest_complexity ?? p.max_complexity ?? 'Unknown',
  dominant: p.dominant_complexity ?? p.max_complexity ?? 'Unknown',
});

const techBadgeClasses: Record<string, string> = {
  React: 'border border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  TypeScript: 'border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300',
  JavaScript: 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  Tailwind: 'border border-teal-500/30 bg-teal-500/15 text-teal-700 dark:text-teal-300',
  Vite: 'border border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-300',
  Recharts: 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Python: 'border border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'Node.js': 'border border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-300',
};

const getTechBadgeClass = (tech: string) =>
  techBadgeClasses[tech] || 'border border-border bg-secondary text-secondary-foreground';

export default function Dashboard() {
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<AggregateEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<string>('503');
  const [supportedRoles, setSupportedRoles] = useState<string[]>([]);
  const [supportedDevConfig, setSupportedDevConfig] = useState<SupportedDevTypesResponse | null>(null);

  // publish modal state
  const [publishModal, setPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [lastPublishAction, setLastPublishAction] = useState<'publish' | 'unpublish' | null>(null);
  const [aiSignalModal, setAiSignalModal] = useState<{
    type: 'repo_score' | 'confidence_score' | 'contribution_percentage';
    projectName: string;
    value: number;
  } | null>(null);

  const signalInfo = {
    repo_score: {
      title: 'Repository Score',
      tooltip: 'Overall quality score for this repository from AI evaluation.',
      explain: (value: number) =>
        value >= 80
          ? 'Strong repository quality with good engineering signals.'
          : value >= 60
            ? 'Good repository quality with room for improvement.'
            : 'Repository quality appears moderate/low based on current signals.',
    },
    confidence_score: {
      title: 'Confidence Score',
      tooltip: 'How confident the AI is in its evaluation for this repository.',
      explain: (value: number) =>
        value >= 80
          ? 'Very high confidence in this evaluation.'
          : value >= 60
            ? 'Good confidence in this evaluation.'
            : 'Lower confidence because available signals are limited.',
    },
    contribution_percentage: {
      title: 'Contribution',
      tooltip: 'Estimated share of contribution by the developer in this repository.',
      explain: (value: number) =>
        value >= 70
          ? 'Primary builder role in this repository.'
          : value >= 40
            ? 'Major contributor role in this repository.'
            : 'Minor or partial contributor role in this repository.',
    },
  } as const;

  // load supported roles
  useEffect(() => {
    getSupportedDevTypesConfig()
      .then((config) => {
        setSupportedDevConfig(config);
        setSupportedRoles(config.supported_dev_types || []);
      })
      .catch(() => {
        setSupportedDevConfig(null);
        setSupportedRoles([]);
      });
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current developer from localStorage and server to ensure signals are fresh
        const localDev = getDeveloper();
        if (!localDev) {
          navigate('/signup', { replace: true });
          return;
        }

        let serverDev: DeveloperProfile;
        try {
          serverDev = await getCurrentDeveloper();
        } catch {
          serverDev = localDev;
        }

        setDeveloper(serverDev);

        // Fetch projects and stats. Let errors bubble instead of swallowing them.
        const projectsData = await getDeveloperProjects(serverDev.id);
        const statsData = await getAggregateEvaluation(serverDev.id);

        setProjects(projectsData || []);
        setStats(statsData);
        setLoading(false);
        // show tip after first stats load
        toast({ title: 'Tip', description: 'You can publish your profile using the button in the actions panel.', });
      } catch (err) {
        if (isAuthError(err)) {
          clearAuth();
          navigate('/signup?error=session_expired', { replace: true });
        } else {
          const message = err instanceof Error ? err.message : 'Failed to load data';
          setErrorStatusCode(isRateLimitError(err) ? '429' : isServiceUnavailableError(err) ? '503' : '500');
          setError(message);
          setLoading(false);
        }
      }
    };

    loadData();
  }, [navigate, toast]);

  // derive published flag when developer data loads
  useEffect(() => {
    if (developer) {
      const hasPublished = !!developer.is_published;
      setPublished(hasPublished);
    }
  }, [developer]);

  // Auto-refresh every 30 seconds to get latest GitHub changes
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let sessionExpired = false;

    const stopAutoRefresh = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const refreshData = async () => {
      if (!developer || sessionExpired) return;

      try {
        const [projectsData, statsData] = await Promise.all([
          getDeveloperProjects(developer.id).catch(() => projects), // Keep old data on error
          getAggregateEvaluation(developer.id).catch(() => stats),
        ]);

        setProjects(projectsData || []);
        setStats(statsData);
      } catch (err) {
        if (isAuthError(err)) {
          sessionExpired = true;
          stopAutoRefresh();
          clearAuth();
          navigate('/signup?error=session_expired', { replace: true });
        }
      }
    };

    intervalId = setInterval(refreshData, 30000); // 30 seconds

    return () => {
      stopAutoRefresh();
    };
  }, [developer, projects, stats, navigate]);

  const handleImportMore = () => {
    // Navigate to profile setup step 2 (same as ProfilePreview)
    navigate('/profile-setup?step=2');
  };

  const handleConfirmPublish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      if (published) {
        // currently public, so unpublish
        await unpublishProfile();
        setPublished(false);
        setLastPublishAction('unpublish');
        setPublishSuccess(true);
        toast({ title: 'Profile hidden', description: 'Your profile is no longer public.' });
      } else {
        await publishProfile();
        setPublished(true);
        setLastPublishAction('publish');
        setPublishSuccess(true);
        toast({ title: 'Profile published', description: 'Your profile is now public.' });
      }
      // auto-close after a moment
      setTimeout(() => {
        setPublishModal(false);
        setPublishSuccess(false);
        setLastPublishAction(null);
      }, 2000);
    } catch (err) {
      toast({ title: published ? 'Unpublish failed' : 'Publish failed', description: err instanceof Error ? err.message : 'Unable to update your profile visibility.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleRefreshEvaluations = async () => {
    try {
      setImporting(true);
      // Re-fetch evaluations
      if (developer) {
        const updatedStats = await getAggregateEvaluation(developer.id);
        setStats(updatedStats);
        
        const updatedProjects = await getDeveloperProjects(developer.id);
        setProjects(updatedProjects || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh evaluations');
      setErrorStatusCode('500');
    } finally {
      setImporting(false);
    }
  };

  // Normalize tech stack - handle cases where backend returns concatenated string
  const normalizeTechStack = (stack: string[] | string | undefined): string[] => {
    if (!stack) return [];
    
    // Common technology names for better splitting
    const knownTechs = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
      'Vue.js', 'Angular', 'Next.js', 'Express', 'Django', 'Flask', 'FastAPI',
      'Spring', 'ASP.NET', 'Laravel', 'Rails', 'PostgreSQL', 'MySQL', 'MongoDB',
      'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'GraphQL', 'REST',
      'Backend', 'Frontend', 'Full-stack', 'DevOps'
    ];
    
    // Helper to split concatenated technology names
    const splitConcatenatedTech = (text: string): string[] => {
      const result: string[] = [];
      let remaining = text;
      
      // Try to match known technologies first
      while (remaining.length > 0) {
        let matched = false;
        for (const tech of knownTechs) {
          if (remaining.startsWith(tech)) {
            result.push(tech);
            remaining = remaining.slice(tech.length);
            matched = true;
            break;
          }
        }
        
        // If no known tech matched, try to split on case changes
        if (!matched) {
          const match = remaining.match(/^[A-Z][a-z]+/);
          if (match) {
            result.push(match[0]);
            remaining = remaining.slice(match[0].length);
          } else {
            // Can't split further, add remainder
            if (remaining) result.push(remaining);
            break;
          }
        }
      }
      
      return result.length > 0 ? result : [text];
    };
    
    // If it's already a proper array with multiple items, return it
    if (Array.isArray(stack) && stack.length > 1) {
      // Check if any item is a concatenated string
      const normalized = stack.flatMap(tech => {
        if (tech.length > 30 && !tech.includes(' ')) {
          return splitConcatenatedTech(tech);
        }
        return [tech];
      });
      return normalized;
    }
    
    // If it's a single-item array, check if it's concatenated
    if (Array.isArray(stack) && stack.length === 1) {
      const item = stack[0];
      if (item.length > 30 && !item.includes(' ')) {
        const split = splitConcatenatedTech(item);
        return split.length > 1 ? split : stack;
      }
      return stack;
    }
    
    // If it's a string, convert to array
    if (typeof stack === 'string') {
      if (stack.includes(',')) return stack.split(',').map(s => s.trim());
      if (stack.includes(';')) return stack.split(';').map(s => s.trim());
      if (stack.length > 30 && !stack.includes(' ')) {
        const split = splitConcatenatedTech(stack);
        return split.length > 1 ? split : [stack];
      }
      return [stack];
    }
    
    return [];
  };

  const getDifficultyColor = (tier?: string) => {
    switch (tier) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Intermediate':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLanguageColor = (language?: string) => {
    const lang = language?.toLowerCase() || '';
    const colorMap: Record<string, string> = {
      'python': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'javascript': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'typescript': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'react': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'java': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'go': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'rust': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'cpp': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'c#': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'ruby': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'php': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'swift': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'kotlin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'html': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'css': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colorMap[lang] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getComplexityColor = (complexity?: string) => {
    const level = complexity?.toLowerCase() || '';
    if (level.includes('beginner') || level.includes('1')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (level.includes('intermediate') || level.includes('2')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (level.includes('advanced') || level.includes('3')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    } else if (level.includes('expert') || level.includes('4')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container px-4 py-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[24px] bg-card p-6 shadow-lg lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-72" />
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </div>
            <div className="rounded-[24px] bg-card p-6 shadow-lg space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-7 w-52" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-44 rounded-[24px]" />
              <Skeleton className="h-44 rounded-[24px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If an error occurred (e.g. database is down), show only the error page
  if (error) {
    const isRateLimited = errorStatusCode === '429';
    const safeErrorMessage = isRateLimited
      ? 'Please wait briefly before trying again.'
      : 'Please try again shortly. If this continues, contact support.';

    return (
      <ErrorScreen
        statusCode={errorStatusCode}
        title={isRateLimited ? 'Too many requests' : 'We could not load your dashboard'}
        subtitle={isRateLimited ? 'You made too many requests in a short period.' : 'The dashboard is temporarily unavailable right now.'}
        message={safeErrorMessage}
        onRetry={() => window.location.reload()}
        primaryActionLabel="Retry"
        onSecondaryAction={() => navigate('/signup')}
        secondaryActionLabel="Go to sign in"
      />
    );
  }

  if (!developer) {
    return null;
  }

  const primaryStack = normalizeTechStack(developer.primary_stack).slice(0, 5);
  const topTechnologies = (() => {
    const fromConfig = supportedDevConfig ? getLanguageCatalog(supportedDevConfig) : [];
    if (fromConfig.length > 0) return fromConfig.slice(0, 5);
    if (stats?.primary_technologies?.length) return stats.primary_technologies.slice(0, 5);
    return Array.from(new Set(projects.map((project) => project.language).filter(Boolean) as string[])).slice(0, 5);
  })();
  const totalCommits = stats?.total_commits ?? projects.reduce((sum, project) => sum + (project.commits_count || 0), 0);
  const repoCountLabel = `${projects.length} ${projects.length === 1 ? 'repository' : 'repositories'}`;
  const experienceValue = developer.experience_signal || 'N/A';
  const verifiedProjectsValue = developer.verified_projects !== undefined ? `${developer.verified_projects}/${projects.length}` : 'N/A';
  const avgConfidenceValue = developer.average_confidence !== undefined ? `${Math.round(developer.average_confidence)}%` : 'N/A';
  const contributionValue = developer.contribution_breakdown
    ? `Primary ${developer.contribution_breakdown['Primary Builder'] || 0} | Major ${developer.contribution_breakdown['Major Contributor'] || 0} | Minor ${developer.contribution_breakdown['Minor Contributor'] || 0}`
    : 'N/A';
  const publicProfileUrl = developer
    ? `${window.location.origin}/dev/${developer.github_username || developer.id}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <div className="mx-auto max-w-6xl px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:px-8 md:pb-8 md:pt-28">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <p className="text-body text-muted-foreground">Welcome back,</p>
            <h1 className="text-display-sm font-bold">{developer.name || developer.github_username}</h1>
            <p className="text-body-sm text-muted-foreground">Here's your developer profile dashboard</p>
          </motion.div>

          <Button
            variant="outline"
            onClick={() => navigate('/profile/edit')}
            className="w-full lg:w-auto gap-2"
          >
            Edit Profile
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-lg border border-destructive bg-destructive/5 p-4"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </motion.div>
        )}

        {developer.is_suspended && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-lg border border-destructive bg-destructive/5 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">
              Your account has been suspended due to inactivity. Some features are disabled.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            data-tour="profile-overview"
            className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {developer.github_avatar && (
                  <img
                    src={developer.github_avatar}
                    alt={developer.name || developer.github_username}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-heading-lg font-bold">{developer.name || developer.github_username}</h2>
                    <span className="text-body-sm text-muted-foreground">@{developer.github_username}</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-body-sm font-medium text-primary">
                      {developer.primary_role || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-3 px-4">
                <div className="flex items-center gap-2 text-body-sm font-medium text-muted-foreground">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span>Tech Stack</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {primaryStack.length > 0 ? (
                    primaryStack.map((tech) => (
                      <span
                        key={tech}
                        className={`rounded-full px-2.5 py-1 text-caption font-medium ${getTechBadgeClass(tech)}`}
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-caption text-muted-foreground">N/A</span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-body-sm">
                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground">Experience</span>
                  <span className="font-medium text-foreground">{experienceValue}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground">Verified Projects</span>
                  <span className="font-medium text-foreground">{verifiedProjectsValue}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground">Avg Confidence</span>
                  <span className="font-medium text-foreground">{avgConfidenceValue}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-4 py-3">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground">Contribution</span>
                  <span className="font-medium text-foreground">{contributionValue}</span>
                </div>
              </div>

              <p className="mt-4 text-body-sm text-muted-foreground">{developer.bio || 'N/A'}</p>

              <div className="mt-6 flex justify-center">
                <a
                  href={`https://github.com/${developer.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-body-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </motion.div>

          {/* Statistics Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
          >
            <h3 className="mb-4 text-heading-sm">Statistics</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-body-sm text-muted-foreground">Repository Quality</p>
                <Progress className="h-2 bg-muted/20" value={Math.round(stats?.repository_quality ?? 0)} />
                <p className="mt-1 text-caption">
                  {stats?.repository_quality !== undefined ? `${Math.round(stats.repository_quality)}%` : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-body-sm text-muted-foreground">Collaborative Development</p>
                <Progress className="h-2 bg-muted/20" value={Math.round(stats?.collaborative_development ?? 0)} />
                <p className="mt-1 text-caption">
                  {stats?.collaborative_development !== undefined ? `${Math.round(stats.collaborative_development)}%` : 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-body-sm text-muted-foreground">Total Projects</p>
                  <p className="text-heading-md">{stats?.total_projects ?? projects.length ?? 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-body-sm text-muted-foreground">Overall Level</p>
                  <p className="text-heading-md capitalize">{stats?.overall_skill_level ?? 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-body-sm text-muted-foreground">Total Commits</p>
                  <p className="text-heading-md">{totalCommits || 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-body-sm text-muted-foreground">Top Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {topTechnologies.length > 0 ? (
                      topTechnologies.map((tech) => (
                        <span
                          key={tech}
                          className={`rounded-full px-2.5 py-1 text-caption font-medium ${getTechBadgeClass(tech)}`}
                         >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-caption text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {!stats && (
                <div className="py-2 text-center">
                  <Button onClick={handleRefreshEvaluations} variant="outline" size="sm" disabled={importing}>
                    {importing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                    Run Evaluation
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            data-tour="actions-card"
            className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-lg transition-all hover:shadow-xl sm:col-span-2 sm:p-6 xl:col-span-1"
          >
            <h3 className="mb-4 text-heading-sm">Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={async () => {
                  if (!developer) return;
                  setImporting(true);
                  try {
                    await getDeveloperAnalyzer(developer.id);
                  } catch {
                    toast({ title: 'Analysis failed', description: 'Unable to start analysis. Please try again.', variant: 'destructive' });
                  } finally {
                    setImporting(false);
                    navigate(`/analysis?dev=${developer?.id}`);
                  }
                }}
                disabled={importing}
                className="w-full gap-2"
                data-tour="run-analysis-btn"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Run Analysis
              </Button>
              <Button
                onClick={handleImportMore}
                variant="outline"
                className="w-full gap-2"
                data-tour="add-repo-btn"
              >
                <Plus className="h-4 w-4" />
                Import More Repos
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile/edit')}
                className="w-full"
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile/cv-upload')}
                className="w-full gap-2"
              >
                <FileUp className="h-4 w-4" />
                Upload CV
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPublishModal(true)}
                className="w-full"
                disabled={publishing}
              >
                {publishing ? (published ? 'Making Profile Private...' : 'Publishing Profile...') : (published ? 'Make Profile Private' : 'Publish Profile')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/settings')}
                className="w-full"
              >
                Go to Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    localStorage.removeItem('v1_intro_completed');
                    localStorage.setItem('v1_intro_requested', '1');
                  } catch (error) {
                    void error;
                  }
                  window.dispatchEvent(new Event('provenly:start-tour'));
                }}
                className="w-full"
              >
                Replay Intro
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-heading-md">Your Repositories</h2>
            <div className="flex items-center gap-4">
              <p className="text-body-sm text-muted-foreground">{projects.length} {projects.length === 1 ? 'repository' : 'repositories'}</p>
            </div>
          </div>

          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              {projects.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-card/50 p-8 text-center">
                  <GitBranch className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-heading-sm">No repositories imported yet</h3>
                  <p className="mb-6 text-body text-muted-foreground">
                    Import your GitHub repositories to see them here with AI-powered evaluations
                  </p>
                  <Button onClick={handleImportMore}>
                    <Plus className="mr-2 h-4 w-4" />
                    Import Your Repositories
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (index * 0.05) }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                      className="group cursor-pointer rounded-[24px] bg-gradient-to-br from-card to-card/80 p-4 shadow-lg transition-all hover:shadow-xl sm:p-6"
                    >
                      {(() => {
                        const metadataWarnings = Array.isArray((project.github_metadata as Record<string, unknown> | undefined)?.warnings)
                          ? ((project.github_metadata as Record<string, unknown>).warnings as string[])
                          : [];
                        const allWarnings = Array.from(new Set([...(project.warnings || []), ...metadataWarnings].filter(Boolean)));

                        if (allWarnings.length === 0) return null;

                        return (
                          <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-100 px-3 py-2 text-caption text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
                            <p className="font-semibold">Advisory warnings</p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-4">
                              {allWarnings.slice(0, 3).map((warning) => (
                                <li key={`${project.id}-${warning}`}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      {(() => {
                        const projectUrl = project.github_url || project.url;
                        const owner = projectUrl
                          ? projectUrl.replace(/^https?:\/\/github\.com\//i, '').split('/')[0]?.toLowerCase()
                          : undefined;
                        const username = developer.github_username?.toLowerCase();
                        const isOrganizationRepo = Boolean(owner && username && owner !== username);
                        const hasVeryLowContribution = isOrganizationRepo && (project.commits_count ?? 0) <= 2;

                        if (!hasVeryLowContribution) return null;

                        return (
                          <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-100 px-3 py-2 text-caption text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
                            Basic contribution detected: this is an organization repository and your visible commit history appears very limited for this project.
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="mb-2 break-words text-heading-sm">{project.name || 'N/A'}</h3>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-body-sm font-semibold text-white shadow-sm">
                                  {(project.ai_evaluation?.difficulty_tier || 'N/A').replace(/\s*complexity\s*/gi, '').trim()} complexity
                                </span>
                                {(() => {
                                  const { highest, dominant } = getComplexityPair(project);
                                  return (
                                    <>
                                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-body-sm font-medium text-secondary-foreground">
                                        Highest: {highest}
                                      </span>
                                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-body-sm font-medium text-secondary-foreground">
                                        Dominant: {dominant}
                                      </span>
                                    </>
                                  );
                                })()}
                                {project.language && (
                                  <span className="inline-flex items-center rounded-full px-3 py-1 text-body-sm font-medium bg-secondary text-secondary-foreground">
                                    {project.language}
                                  </span>
                                )}
                              </div>
                              <div className="mb-1 flex flex-wrap items-center gap-3 text-body-sm">
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 font-semibold text-primary">
                                  {project.ai_evaluation?.repo_score !== undefined ? `${Math.round(project.ai_evaluation.repo_score)}% score` : 'N/A score'}
                                </span>
                                {project.ai_evaluation?.confidence_score !== undefined && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-0.5 text-secondary-foreground">
                                    {Math.round(project.ai_evaluation.confidence_score)}% confidence
                                  </span>
                                )}
                                {project.ai_evaluation?.contribution_percentage !== undefined && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-0.5 text-secondary-foreground">
                                    {Math.round(project.ai_evaluation.contribution_percentage)}% contribution
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted/20 px-3 py-0.5 text-muted-foreground">
                                  <GitBranch className="h-3 w-3" />
                                  {project.commits_count !== undefined ? `${project.commits_count} commits` : 'N/A commits'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                              Active
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-muted-foreground transition hover:text-primary"
                                  onClick={(e) => e.stopPropagation()}
                                  title="View on GitHub"
                                >
                                  <Github className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          <p className="text-body-sm text-muted-foreground">
                            {project.description || 'N/A'}
                          </p>

                          <div className="mt-4 flex justify-start">
                            {project.ai_evaluation && (
                              <div className="mb-3 mr-2 inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-caption text-muted-foreground">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                                      <Info className="h-3.5 w-3.5" />
                                      AI signals
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    Hover/help for score, confidence, and contribution. Click view more for details.
                                  </TooltipContent>
                                </Tooltip>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-caption"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const confidence = project.ai_evaluation?.confidence_score;
                                    const contribution = project.ai_evaluation?.contribution_percentage;
                                    const repo = project.ai_evaluation?.repo_score;
                                    if (confidence !== undefined) {
                                      setAiSignalModal({ type: 'confidence_score', projectName: project.name || 'N/A', value: Number(confidence) });
                                      return;
                                    }
                                    if (contribution !== undefined) {
                                      setAiSignalModal({ type: 'contribution_percentage', projectName: project.name || 'N/A', value: Number(contribution) });
                                      return;
                                    }
                                    if (repo !== undefined) {
                                      setAiSignalModal({ type: 'repo_score', projectName: project.name || 'N/A', value: Number(repo) });
                                    }
                                  }}
                                >
                                  View more
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/projects/${project.id}`);
                              }}
                            >
                              View more about project
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <div className="rounded-[24px] border border-dashed border-border bg-card/50 p-8 text-center">
                <h3 className="mb-2 text-heading-sm">Feature coming soon</h3>
                <p className="text-body text-muted-foreground">Education details will appear here soon.</p>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <div className="rounded-[24px] border border-dashed border-border bg-card/50 p-8 text-center">
                <h3 className="mb-2 text-heading-sm">Feature coming soon</h3>
                <p className="text-body text-muted-foreground">Experience details will appear here soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={!!aiSignalModal} onOpenChange={(open) => !open && setAiSignalModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{aiSignalModal ? signalInfo[aiSignalModal.type].title : 'AI Signal'}</DialogTitle>
            <DialogDescription>
              {aiSignalModal?.projectName}
            </DialogDescription>
          </DialogHeader>
          {aiSignalModal && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-caption text-muted-foreground">Value</p>
                <p className="text-heading-lg font-bold">{Math.round(aiSignalModal.value)}%</p>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {signalInfo[aiSignalModal.type].tooltip}
              </p>
              <p className="text-body-sm">
                {signalInfo[aiSignalModal.type].explain(aiSignalModal.value)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* publish confirmation modal */}
      <Dialog open={publishModal} onOpenChange={setPublishModal}>
        <DialogContent>
          {!publishSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>{published ? 'Make Profile Private' : 'Publish Your Profile'}</DialogTitle>
                <DialogDescription>
                  {published
                    ? 'Hiding your profile will make it inaccessible to others. Are you sure you want to continue?'
                    : 'Making your profile public will allow others to view it. Are you sure you want to proceed?'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPublishModal(false)} disabled={publishing}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmPublish} disabled={publishing} className="ml-2">
                  {publishing ? (published ? 'Making Private...' : 'Publishing...') : (published ? 'Make Private' : 'Publish')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col items-center gap-2">
                <Check className="h-8 w-8 text-green-500" />
                <p className="text-lg font-semibold">
                  {lastPublishAction === 'unpublish' ? 'Your profile is now private' : 'Your profile is now public!'}
                </p>
                {lastPublishAction === 'publish' && publicProfileUrl && (
                  <>
                    <p className="text-center text-body-sm text-muted-foreground">
                      Share your public developer profile using this link:
                    </p>
                    <a
                      href={publicProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-primary hover:bg-primary/5"
                    >
                      {publicProfileUrl}
                    </a>
                  </>
                )}
                {lastPublishAction === 'unpublish' && publicProfileUrl && (
                  <p className="text-center text-body-sm text-muted-foreground">
                    The public link is now disabled while your profile is private: {publicProfileUrl}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
