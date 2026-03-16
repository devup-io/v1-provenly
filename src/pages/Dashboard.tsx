import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Github, Loader2, AlertCircle, RefreshCw, Plus, GitBranch, GitCommit, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDeveloper, getDeveloperProjects, getAggregateEvaluation, clearAuth, getCurrentDeveloper, getSupportedDevTypes, publishProfile, unpublishProfile, getDeveloperAnalyzer } from '@/lib/api';
import type { DeveloperProfile, Project, AggregateEvaluation, AIEvaluation } from '@/types/api';

// configuration per detected project type for signal emphasis
const PROJECT_TYPE_CONFIG: Record<string, { badge: string; weights: Record<string, number> }> = {
  Frontend: {
    badge: 'frontend-aligned',
    weights: { code_quality: 30, architecture_quality: 25, engineering_depth: 20, commit_quality: 15, production_readiness: 10 },
  },
  Backend: {
    badge: 'backend-aligned',
    weights: { engineering_depth: 30, architecture_quality: 25, production_readiness: 20, code_quality: 15, commit_quality: 10 },
  },
  'Full-stack': {
    badge: 'fullstack',
    weights: { engineering_depth: 22, architecture_quality: 22, code_quality: 22, commit_quality: 22, production_readiness: 12 },
  },
  Mobile: {
    badge: 'mobile',
    weights: { code_quality: 30, architecture_quality: 25, engineering_depth: 20, commit_quality: 15, production_readiness: 10 },
  },
  DevOps: {
    badge: 'devops',
    weights: { production_readiness: 35, engineering_depth: 25, architecture_quality: 20, code_quality: 10, commit_quality: 10 },
  },
  'AI/ML': {
    badge: 'ai-ml',
    weights: { engineering_depth: 25, commit_quality: 20, production_readiness: 20, architecture_quality: 20, code_quality: 15 },
  },
  'Blockchain / Web3': {
    badge: 'blockchain',
    weights: { engineering_depth: 25, commit_quality: 20, production_readiness: 20, architecture_quality: 20, code_quality: 15 },
  },
  Data: {
    badge: 'data',
    weights: { architecture_quality: 25, production_readiness: 20, commit_quality: 20, engineering_depth: 20, code_quality: 15 },
  },
  Security: {
    badge: 'security',
    weights: { engineering_depth: 30, production_readiness: 25, architecture_quality: 20, commit_quality: 15, code_quality: 10 },
  },
};

const signalOrder = ['code_quality','architecture_quality','engineering_depth','commit_quality','production_readiness'];

function renderSignals(evaluation: AIEvaluation, detectedType?: string) {
  const config = detectedType ? PROJECT_TYPE_CONFIG[detectedType] : undefined;
  let primarySignal: string | null = null;
  if (config) {
    const entries = Object.entries(config.weights);
    entries.sort((a,b)=>b[1]-a[1]);
    primarySignal = entries[0][0];
  }
  return (
    <div className="space-y-1 text-caption">
      {signalOrder.map((sig) => {
        const score =
          sig === 'code_quality'
            ? evaluation.code_quality_score
            : sig === 'architecture_quality'
            ? evaluation.architecture_score
            : sig === 'engineering_depth'
            ? evaluation.engineering_depth_score
            : sig === 'commit_quality'
            ? evaluation.commit_quality_score
            : sig === 'production_readiness'
            ? evaluation.production_readiness_score
            : undefined;
        if (score === undefined) return null;
        const isPrimary = sig === primarySignal;
        return (
          <div key={sig} className="flex items-center gap-2">
            <span className={`${isPrimary ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {sig.replace(/_/g,' ')}:
            </span>
            <div className="flex-1 bg-muted/20 rounded-full h-2">
              <div className={`bg-primary h-2 rounded-full w-[${Math.round(score)}%]`} />
            </div>
            <span>{Math.round(score)}</span>
          </div>
        );
      })}
      {evaluation.production_readiness_score !== undefined && evaluation.production_readiness_score >= 70 && (
        <div className="mt-1 text-green-600 flex items-center gap-1">
          <span>Deployed</span>
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<AggregateEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [supportedRoles, setSupportedRoles] = useState<string[]>([]);

  // publish modal state
  const [publishModal, setPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [lastPublishAction, setLastPublishAction] = useState<'publish' | 'unpublish' | null>(null);

  // load supported roles
  useEffect(() => {
    getSupportedDevTypes().then(setSupportedRoles).catch((e) => console.warn('[Dashboard] failed to load supported roles', e));
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current developer from localStorage and server to ensure signals are fresh
        const localDev = getDeveloper();
        if (!localDev) {
          console.warn('[Dashboard] No developer found in localStorage');
          navigate('/signup');
          return;
        }

        let serverDev: DeveloperProfile;
        try {
          serverDev = await getCurrentDeveloper();
        } catch (err) {
          console.warn('[Dashboard] failed to fetch current developer, using cached', err);
          serverDev = localDev;
        }

        console.log('[Dashboard] Loading data for developer:', serverDev.id);
        setDeveloper(serverDev);

        // Fetch projects and stats. Let errors bubble instead of swallowing them.
        console.log('[Dashboard] Fetching projects and stats for developer:', serverDev.id);
        const projectsData = await getDeveloperProjects(serverDev.id);
        const statsData = await getAggregateEvaluation(serverDev.id);

        setProjects(projectsData || []);
        setStats(statsData);
        setLoading(false);
        // show tip after first stats load
        toast({ title: 'Tip', description: 'You can publish your profile using the button in the actions panel.', });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        let message = err instanceof Error ? err.message : 'Failed to load data';
        // If the backend is down/DB error, don't expose raw message
        if (message.includes('500') || message.toLowerCase().includes('database')) {
          // show generic 503 message
          message = 'Service unavailable (503). Please try again later.';
        }
        
        // Check for session expiration (401/403 errors)
        if (message.includes('401') || message.includes('403') || message.includes('Unauthorized')) {
          clearAuth();
          navigate('/signup?error=session_expired');
        } else {
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
      const hasPublished = !!developer.is_published || !!developer.profile_complete;
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
        console.log('[Dashboard] Auto-refreshing data (30s interval)...');
        const [projectsData, statsData] = await Promise.all([
          getDeveloperProjects(developer.id).catch(() => projects), // Keep old data on error
          getAggregateEvaluation(developer.id).catch(() => stats),
        ]);

        setProjects(projectsData || []);
        setStats(statsData);
        console.log('[Dashboard] Auto-refresh completed');
      } catch (err) {
        console.warn('[Dashboard] Auto-refresh failed:', err);

        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('401') || message.includes('403') || message.toLowerCase().includes('unauthorized')) {
          sessionExpired = true;
          stopAutoRefresh();
          clearAuth();
          navigate('/signup?error=session_expired');
        }

        // Don't show errors for auto-refresh, just log them
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
      console.error('[Dashboard] publish toggle failed', err);
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
      console.error('Failed to refresh evaluations:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh evaluations');
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-body text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If an error occurred (e.g. database is down), show only the error page
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
        <div className="text-center max-w-md space-y-6">
          <h1 className="text-display-sm font-bold text-destructive">503</h1>
          <p className="mt-2 text-xl font-semibold text-destructive">Service Unavailable</p>
          <p className="mt-4 text-body text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mx-auto mt-4 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!developer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-display-sm">Welcome, {developer.name || developer.github_username}!</h1>
            <p className="text-body text-muted-foreground">Here's your developer profile dashboard</p>
          </motion.div>
          <Button
            variant="outline"
            onClick={() => navigate('/profile-setup')}
            className="gap-2"
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

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="col-span-1 rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col items-center text-center">
              {developer.github_avatar && (
                <img
                  src={developer.github_avatar}
                  alt={developer.name || developer.github_username}
                  className="mb-4 h-20 w-20 rounded-full object-cover"
                />
              )}
              <h2 className="text-heading-sm">{developer.name || developer.github_username}</h2>
              <p className="text-body-sm text-muted-foreground">@{developer.github_username}</p>

              {developer.primary_role && (
                <span className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-body-sm font-medium text-primary">
                  {developer.primary_role}
                </span>
              )}
              {supportedRoles.length > 0 && (
                <div className="mt-2 text-caption text-muted-foreground">
                  Supported roles: {supportedRoles.join(', ')}
                </div>
              )}
              {developer.primary_role && supportedRoles.length > 0 && !supportedRoles.includes(developer.primary_role) && (
                <div className="mt-2 rounded-md bg-yellow-100 p-2 text-yellow-800 text-caption">
                  Your declared role (‘{developer.primary_role}’) is not currently supported; evaluations may be limited.
                </div>
              )}

                <div className="mt-4 space-y-2 text-body-sm text-muted-foreground">
                  {developer.experience_signal && (
                    <div>Experience: {developer.experience_signal}</div>
                  )}
                  {developer.verified_projects !== undefined && (
                    <div>Verified projects: {developer.verified_projects}/{projects.length}</div>
                  )}
                  {developer.average_confidence !== undefined && (
                    <div>Avg confidence: {Math.round(developer.average_confidence)}%</div>
                  )}
                  {developer.contribution_breakdown && (
                    <div>
                      Contribution: Primary {developer.contribution_breakdown['Primary Builder']||0} | Major {developer.contribution_breakdown['Major Contributor']||0} | Minor {developer.contribution_breakdown['Minor Contributor']||0}
                    </div>
                  )}
                </div>

              {/* primary tech stack */}
              {developer.primary_stack && developer.primary_stack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {developer.primary_stack.map((tech: string) => (
                    <span
                      key={tech}
                      className="rounded-full px-3 py-1.5 text-body-sm bg-secondary border border-secondary/70 dark:bg-secondary/10 dark:border-secondary/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {developer.bio && (
                <p className="mt-4 text-body-sm text-muted-foreground">{developer.bio}</p>
              )}

              <a
                href={`https://github.com/${developer.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-2 text-primary hover:underline"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </motion.div>

          {/* Statistics Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="col-span-1 rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <h3 className="mb-4 text-heading-sm">Statistics</h3>
            {stats ? (
              <div className="space-y-4">
                {/* colored progress bars first */}
                {stats.repository_quality !== undefined && (
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-body-sm text-muted-foreground">Repository Quality</p>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div
                        className={`bg-primary h-2 rounded-full w-[${Math.round(stats.repository_quality)}%]`}
                      />
                    </div>
                    <p className="mt-1 text-caption">{Math.round(stats.repository_quality)}%</p>
                  </div>
                )}
                {stats.collaborative_development !== undefined && (
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-body-sm text-muted-foreground">Collaborative Development</p>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div
                        className={`bg-primary h-2 rounded-full w-[${Math.round(stats.collaborative_development)}%]`}
                      />
                    </div>
                    <p className="mt-1 text-caption">{Math.round(stats.collaborative_development)}%</p>
                  </div>
                )}

                {/* numeric summary items */}
                <div>
                  <p className="text-body-sm text-muted-foreground">Total Projects</p>
                  <p className="text-heading-md">{stats.total_projects || 0}</p>
                </div>
                <div>
                  <p className="text-body-sm text-muted-foreground">Overall Level</p>
                  <p className="text-heading-md capitalize">{stats.overall_skill_level || 'Not evaluated'}</p>
                </div>
                <div>
                  <p className="text-body-sm text-muted-foreground">Total Commits</p>
                  <p className="text-heading-md">
                    {(() => {
                      const total = stats.total_commits || projects.reduce((sum, p) => sum + (p.commits_count || 0), 0);
                      console.log('[Dashboard] Total commits calculation:', { statsCommits: stats.total_commits, projectsCommits: projects.map(p => ({ name: p.name, commits: p.commits_count })), total });
                      return total || 0;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-muted-foreground mb-2">Top Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.primary_technologies && stats.primary_technologies.length > 0 ? (
                      stats.primary_technologies.slice(0, 3).map((tech: string) => (
                        <span key={tech} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-caption font-medium">
                          {tech}
                        </span>
                      ))
                    ) : projects.some(p => p.language) ? (
                      Array.from(new Set(projects.map(p => p.language).filter(Boolean)))
                        .slice(0, 3)
                        .map((tech: string) => (
                          <span key={tech} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-caption font-medium">
                            {tech}
                          </span>
                        ))
                    ) : (
                      <span className="text-caption text-muted-foreground">No technologies yet</span>
                    )}
                  </div>
                </div>
                {stats.evaluation_profile_counts && (
                  <div>
                    <p className="text-body-sm text-muted-foreground">Profiles</p>
                    <ul className="text-caption">
                      {Object.entries(stats.evaluation_profile_counts).map(([k,v]) => (
                        <li key={k}>{k}: {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {stats.detected_project_type_counts && (
                  <div>
                    <p className="text-body-sm text-muted-foreground">Project types</p>
                    <ul className="text-caption">
                      {Object.entries(stats.detected_project_type_counts).map(([k,v]) => (
                        <li key={k}>{k}: {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-body-sm text-muted-foreground mb-4">No evaluation data yet</p>
                <Button onClick={handleRefreshEvaluations} variant="outline" size="sm" disabled={importing}>
                  {importing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                  Run Evaluation
                </Button>
              </div>
            )}
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="col-span-1 rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <h3 className="mb-4 text-heading-sm">Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={handleImportMore}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Import More Repos
              </Button>
              <Button
                onClick={async () => {
                  if (!developer) return;
                  setImporting(true);
                  try {
                    // Trigger backend analysis and then navigate to the analysis page
                    await getDeveloperAnalyzer(developer.id);
                  } catch (err) {
                    console.error('[Dashboard] Failed to trigger analysis', err);
                    toast({ title: 'Analysis failed', description: 'Unable to start analysis. Please try again.', variant: 'destructive' });
                  } finally {
                    setImporting(false);
                    navigate(`/analysis?dev=${developer?.id}`);
                  }
                }}
                disabled={importing}
                variant="outline"
                className="w-full gap-2"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Run Analysis
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile-setup')}
                className="w-full mt-2"
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/settings')}
                className="w-full mt-2"
              >
                Go to Settings
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPublishModal(true)}
                className="w-full mt-2"
                disabled={publishing}
              >
                {published ? 'Make Profile Private' : (publishing ? (published ? 'Unpublishing...' : 'Publishing...') : 'Publish Profile')}
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
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index * 0.05) }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  className="group rounded-[24px] bg-gradient-to-br from-card to-card/80 p-6 shadow-lg hover:shadow-xl cursor-pointer transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* left column: basic info */}
                    <div>
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-heading-sm mb-2 break-words">{project.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {project.ai_evaluation?.difficulty_tier && (
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-body-sm font-semibold text-white bg-blue-600 shadow-sm">
                                {(project.ai_evaluation.difficulty_tier).replace(/\s*complexity\s*/gi, '').trim()} complexity
                              </span>
                            )}
                            {project.language && (
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-body-sm font-medium bg-secondary text-secondary-foreground">
                                {project.language}
                              </span>
                            )}
                          </div>
                          <div className="mb-1 flex flex-wrap items-center gap-3 text-body-sm">
                            {project.ai_evaluation?.repo_score !== undefined && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 font-semibold text-primary">
                                {Math.round(project.ai_evaluation.repo_score)}% score
                              </span>
                            )}
                            {project.commits_count !== undefined && (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <GitCommit className="h-3.5 w-3.5" />
                                {project.commits_count} commits
                              </span>
                            )}
                          </div>
                          {/* show tech stack if available */}
                          {project.primary_stack && project.primary_stack.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {project.primary_stack.slice(0,3).map(tech => (
                                <span key={tech} className="rounded-full bg-secondary px-2 py-0.5 text-caption">
                                  {tech}
                                </span>
                              ))}
                              {project.primary_stack.length > 3 && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                                  +{project.primary_stack.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition"
                            title="View on GitHub"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}                          {project.warnings && project.warnings.length > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-caption text-yellow-800">
                              ⚠️ {project.warnings.length}
                            </span>
                          )}                      </div>

                      {project.description && (
                        <div className="mb-4">
                          <p className="text-caption font-semibold text-muted-foreground mb-1">Description</p>
                          <p className="text-body-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* right column: stars only */}
                    <div>
                      {project.stars !== undefined && project.stars > 0 && (
                        <div className="flex items-center gap-1.5 text-caption text-amber-700 dark:text-amber-300">
                          <Star className="h-3.5 w-3.5" />
                          <span className="font-medium">{project.stars} stars</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/projects/${project.id}`);
                    }}
                  >
                    View More About This Project
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

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
                  {publishing
                    ? lastPublishAction === 'unpublish'
                      ? 'Unpublishing...'
                      : 'Publishing...'
                    : lastPublishAction === 'unpublish'
                    ? 'Unpublish'
                    : 'Publish'}
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
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
