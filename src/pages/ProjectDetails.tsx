import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Star,
  GitBranch,
  Code2,
  Globe,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getDeveloperProjects, refreshProjectData, getProjectEvaluationLogs } from '@/lib/api';
import type { Project, AIEvaluation, ProjectEvaluationLog } from '@/types/api';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshMode, setRefreshMode] = useState<'manual' | 'latest' | 'auto'>('manual');
  const [logsVisible, setLogsVisible] = useState(false);
  const [refreshLogs, setRefreshLogs] = useState<ProjectEvaluationLog[]>([]);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projects = await getDeveloperProjects();
        const found = projects.find(p => p.id === projectId);

        if (!found) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        setProject(found);
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load project';
        setError(message);
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadRefreshLogs = async (projectId: string) => {
    try {
      const logs = await getProjectEvaluationLogs(projectId);
      setRefreshLogs(logs);
    } catch {
      setRefreshLogs([]);
    }
  };

  const handleRefresh = async () => {
    if (!project) return;

    try {
      setRefreshing(true);

      if (refreshMode === 'manual') {
        setLogsVisible(true);
        await loadRefreshLogs(project.id);
      }

      const refreshed = await refreshProjectData(project.id);
      setProject(refreshed);

      if (refreshMode === 'manual') {
        await loadRefreshLogs(project.id);
      }

      setRefreshing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh project';
      setError(message);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-body text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container max-w-4xl">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-6">
            ← Back to Dashboard
          </Button>
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-destructive mt-1" />
              <div>
                <h3 className="font-semibold text-destructive">Error Loading Project</h3>
                <p className="text-body-sm text-muted-foreground mt-2">
                  {error || 'Project not found'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const evaluation = project.ai_evaluation;

  // configuration for how to emphasize signals based on detected project type
  const typeConfigs: Record<
    string,
    {
      primary: keyof AIEvaluation;
      secondary: keyof AIEvaluation;
      tertiary?: keyof AIEvaluation;
      icon: JSX.Element;
      badgeColor: string;
      tooltip: string;
      weights: Partial<Record<keyof AIEvaluation, number>>;
    }
  > = {
    Frontend: {
      primary: 'code_quality_score',
      secondary: 'architecture_score',
      tertiary: 'production_readiness_score',
      icon: <Code2 className="h-4 w-4" />, // placeholder
      badgeColor: 'bg-pastel-blue text-pastel-blue-foreground',
      tooltip: 'For user-facing apps we prioritise clean, maintainable code.',
      weights: {
        code_quality_score: 0.3,
        architecture_score: 0.25,
        engineering_depth_score: 0.2,
        commit_quality_score: 0.15,
        production_readiness_score: 0.1,
      },
    },
    Backend: {
      primary: 'engineering_depth_score',
      secondary: 'architecture_score',
      tertiary: 'production_readiness_score',
      icon: <TrendingUp className="h-4 w-4" />,
      badgeColor: 'bg-pastel-mint text-pastel-mint-foreground',
      tooltip: 'Server-side projects emphasise depth and architecture.',
      weights: {
        engineering_depth_score: 0.3,
        architecture_score: 0.25,
        production_readiness_score: 0.2,
        code_quality_score: 0.15,
        commit_quality_score: 0.1,
      },
    },
    'Full-stack': {
      primary: 'code_quality_score',
      secondary: 'engineering_depth_score',
      tertiary: 'architecture_score',
      icon: <GitBranch className="h-4 w-4" />,
      badgeColor: 'bg-gradient-to-r from-pastel-blue to-pastel-mint text-white',
      tooltip: 'Balanced emphasis across frontend and backend concerns.',
      weights: {
        engineering_depth_score: 0.2,
        architecture_score: 0.2,
        code_quality_score: 0.2,
        commit_quality_score: 0.2,
        production_readiness_score: 0.2,
      },
    },
    Mobile: {
      primary: 'code_quality_score',
      secondary: 'architecture_score',
      tertiary: 'production_readiness_score',
      icon: <Globe className="h-4 w-4" />,
      badgeColor: 'bg-pastel-peach text-pastel-peach-foreground',
      tooltip: 'Mobile apps prioritise clean code and platform architecture.',
      weights: {
        code_quality_score: 0.3,
        architecture_score: 0.25,
        engineering_depth_score: 0.2,
        commit_quality_score: 0.15,
        production_readiness_score: 0.1,
      },
    },
    DevOps: {
      primary: 'production_readiness_score',
      secondary: 'engineering_depth_score',
      tertiary: 'architecture_score',
      icon: <Zap className="h-4 w-4" />,
      badgeColor: 'bg-pastel-yellow text-pastel-yellow-foreground',
      tooltip: 'Infrastructure projects emphasise production readiness.',
      weights: {
        production_readiness_score: 0.35,
        engineering_depth_score: 0.25,
        architecture_score: 0.2,
        code_quality_score: 0.1,
        commit_quality_score: 0.1,
      },
    },
    //'AI / ML': {...} will fallback later
  };

  const projectType = evaluation?.detected_project_type || evaluation?.evaluation_profile || '';
  const config = typeConfigs[projectType] || {
    primary: 'code_quality_score' as keyof AIEvaluation,
    secondary: 'architecture_score' as keyof AIEvaluation,
    icon: <BarChart3 className="h-4 w-4" />,
    badgeColor: 'bg-secondary text-secondary-foreground',
    tooltip: '',
    weights: {},
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-[32px] border border-border bg-card p-8 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="mb-8">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>

          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-display-sm">{project.name}</h1>
                {evaluation?.difficulty_tier && (
                  <span className="rounded-full bg-pastel-yellow px-3 py-1 text-body-sm font-semibold text-pastel-yellow-foreground">
                    {evaluation.difficulty_tier}{
                      evaluation.difficulty_tier === 'Beginner' ? ' (L1)' :
                      evaluation.difficulty_tier === 'Intermediate' ? ' (L2)' :
                      evaluation.difficulty_tier === 'Advanced' ? ' (L3)' :
                      ''
                    }
                  </span>
                )}
                {project.evaluation_status && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-body-sm font-semibold text-secondary-foreground">
                    {project.evaluation_status.replace(/_/g, ' ')}{project.evaluation_status === 'completed' ? ' project' : ''}
                  </span>
                )}
                {(evaluation?.detected_project_type === 'Unsupported' || evaluation?.evaluation_profile === 'Unsupported') && (
                  <div className="mt-2 rounded-md bg-destructive/10 p-2 text-destructive text-caption">
                    This repository appears to be a type we do not currently support; the evaluation is generic and will not strengthen any profile role.
                  </div>
                )}
                {evaluation?.detected_project_type && (
                  <div className="mt-2 text-caption text-muted-foreground">Type: {evaluation.detected_project_type}</div>
                )}
                {evaluation?.evaluation_profile && (
                  <div className="mt-1 text-caption text-muted-foreground">Profile: {evaluation.evaluation_profile}</div>
                )}
                {config.weights && Object.keys(config.weights).length > 0 && (
                  <div
                    className="ml-2 text-caption text-muted-foreground cursor-help"
                    title={
                      Object.entries(config.weights)
                        .map(([k,v]) => `${k.replace('_score','')} ${Math.round(v*100)}%`)
                        .join(', ')
                    }
                  >
                    (weights)
                  </div>
                )}
              </div>

              {project.description && (
                <p className="text-body text-muted-foreground mb-6">{project.description}</p>
              )}

              <div className="flex flex-wrap gap-6 text-body-sm text-muted-foreground">
                {project.language && (
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    <span>{project.language}</span>
                  </div>
                )}
                {project.stars !== undefined && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>{project.stars} stars</span>
                  </div>
                )}
                {project.forks !== undefined && (
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <span>{project.forks} forks</span>
                  </div>
                )}
                {project.last_updated && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Updated {new Date(project.last_updated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="text-caption text-muted-foreground">Commits</p>
                  <p className="font-semibold">{project.commits_count ?? 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="text-caption text-muted-foreground">Repository Score</p>
                  <p className="font-semibold">
                    {evaluation?.repo_score !== undefined ? `${Math.round(evaluation.repo_score)}%` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="text-caption text-muted-foreground">Detected Type</p>
                  <p className="font-semibold">{evaluation?.detected_project_type || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="text-caption text-muted-foreground">Role Alignment</p>
                  <p className="font-semibold">{evaluation?.primary_role_alignment || 'N/A'}</p>
                </div>
              </div>

              {evaluation && (
                <div className="mt-6 space-y-4">
                  {(evaluation.contribution_percentage !== undefined || evaluation.contribution_level) && (
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h4 className="font-semibold">Commit Metrics</h4>
                      {evaluation.contribution_level && (
                        <p className="text-body-sm">Level: {evaluation.contribution_level}</p>
                      )}
                      {evaluation.contribution_percentage !== undefined && (
                        <p className="text-body-sm">
                          {evaluation.contribution_percentage}% ({evaluation.developer_commit_count || 0}/{evaluation.total_repo_commits || 0} commits)
                        </p>
                      )}
                      {evaluation.pr_count !== undefined && (
                        <p className="text-body-sm">PRs: {evaluation.pr_count}</p>
                      )}
                    </div>
                  )}

                  {evaluation.confidence_level && (
                    <div>
                      <h4 className="font-semibold">Confidence Score</h4>
                      <p className="text-body-sm">
                        Level: {evaluation.confidence_level} {evaluation.confidence_score !== undefined && `(${evaluation.confidence_score})`}
                      </p>
                      <ul className="list-disc list-inside text-body-sm">
                        {evaluation.commit_frequency_signal && <li>Frequency: {evaluation.commit_frequency_signal}</li>}
                        {evaluation.commit_distribution_signal && <li>Distribution: {evaluation.commit_distribution_signal}</li>}
                        {evaluation.development_timeline_signal && <li>Timeline: {evaluation.development_timeline_signal}</li>}
                      </ul>
                    </div>
                  )}

                  {evaluation.verified_badge && (
                    <div className="text-green-500 font-semibold">
                      ✅ Verified project
                    </div>
                  )}

                  {evaluation.primary_role_alignment && (
                    <div>
                      <h4 className="font-semibold">Project Type</h4>
                      <p className="text-body-sm flex items-center gap-1">
                        {evaluation.primary_role_alignment}
                        <span className="text-caption text-muted-foreground">project</span>
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
              {project.github_url && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Refresh controls at the end of the card */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Select value={refreshMode} onValueChange={(v: string) => setRefreshMode(v as 'manual' | 'latest' | 'auto')}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Refresh mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual refresh</SelectItem>
                <SelectItem value="latest">Refresh on latest commit</SelectItem>
                <SelectItem value="auto">Automatic refresh</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setLogsVisible(true);
                await loadRefreshLogs(project.id);
              }}
            >
              View refresh logs
            </Button>
          </div>

          <AnimatePresence>
            {logsVisible && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 right-0 w-full md:w-1/2 bg-background shadow-xl p-6 overflow-auto z-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Refresh Logs</h2>
                  <Button variant="ghost" onClick={() => setLogsVisible(false)}>Close</Button>
                </div>
                {refreshLogs.length === 0 ? (
                  <p className="text-caption text-muted-foreground py-1">No evaluation logs available yet.</p>
                ) : (
                  refreshLogs.map((log) => (
                    <div key={log.id} className="mb-3 rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-body-sm font-semibold capitalize">{log.status}</p>
                        <p className="text-caption text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-caption text-muted-foreground mt-1">
                        Trigger: {log.trigger || 'unknown'} • Source: {log.source || 'unknown'}
                      </p>
                      {log.detail && <p className="text-body-sm mt-2">{log.detail}</p>}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AI Evaluation Card */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 rounded-[32px] border border-border bg-card p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-heading-sm mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Evaluation
            </h2>

            {/* Check if scores are available */}
            {evaluation.repo_score !== undefined && evaluation.repo_score > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <ScoreCard label="Overall Score" score={evaluation.repo_score} />
                <ScoreCard label="Engineering Depth" score={evaluation.engineering_depth_score ?? 0} />
                <ScoreCard label="Architecture Quality" score={evaluation.architecture_score ?? 0} />
                <ScoreCard label="Code Quality" score={evaluation.code_quality_score ?? 0} />
                <ScoreCard label="Production Readiness" score={evaluation.production_readiness_score ?? 0} />
                <ScoreCard label="Commit Quality" score={evaluation.commit_quality_score ?? 0} />
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900 mb-6">
                <p className="text-body-sm text-amber-700 dark:text-amber-300">
                  <strong>AI Evaluation Pending:</strong> This project's detailed scoring is being analyzed. 
                  Basic complexity assessment is available below.
                </p>
              </div>
            )}

            {evaluation.overall_assessment && (
              <div className="rounded-lg bg-muted/30 p-4 border border-border mb-4">
                <p className="text-body-sm">{evaluation.overall_assessment}</p>
              </div>
            )}

            {evaluation.summary && (
              <div className="rounded-lg bg-muted/30 p-4 border border-border mb-4">
                <p className="text-caption font-semibold text-muted-foreground mb-2">SUMMARY</p>
                <p className="text-body-sm">{evaluation.summary}</p>
              </div>
            )}

            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-900 mb-4">
                <p className="text-caption font-semibold text-green-700 dark:text-green-400 mb-2">STRENGTHS</p>
                <ul className="space-y-1">
                  {evaluation.strengths.map((strength, idx) => (
                    <li key={idx} className="text-body-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                      <span className="text-primary flex-shrink-0">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900">
                <p className="text-caption font-semibold text-amber-700 dark:text-amber-400 mb-2">AREAS FOR IMPROVEMENT</p>
                <ul className="space-y-1">
                  {evaluation.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-body-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.estimated_developer_level && (
              <div className="mt-6 rounded-lg bg-primary/10 p-4 border border-primary/20 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-caption font-semibold text-primary">ESTIMATED DEVELOPER LEVEL</p>
                  <p className="text-body font-semibold text-foreground">{evaluation.estimated_developer_level}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Commit Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 rounded-[32px] border border-border bg-card p-8 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-heading-sm mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Commit Metrics
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -4 }}
              className="rounded-[24px] bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-caption font-medium text-muted-foreground mb-2">TOTAL COMMITS</p>
              <p className="text-display-sm font-bold">
                {project.commits_count !== undefined && project.commits_count > 0 ? project.commits_count : 'N/A'}
              </p>
              {project.commits_count === 0 && (
                <p className="text-caption text-muted-foreground mt-1">No commit data available</p>
              )}
            </motion.div>
            <motion.div 
              whileHover={{ y: -4 }}
              className="rounded-[24px] bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-caption font-medium text-muted-foreground mb-2">COMMITS PER WEEK</p>
              <p className="text-display-sm font-bold">
                {project.commits_count && project.commits_count > 0 ? (project.commits_count / 52).toFixed(1) : 'N/A'}
              </p>
              {project.commits_count === 0 && (
                <p className="text-caption text-muted-foreground mt-1">Calculated after commits load</p>
              )}
            </motion.div>
          </div>
          
          {project.commits_count === 0 && (
            <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-900">
              <p className="text-body-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Commit data is being fetched from GitHub. 
                Try refreshing the project to update metrics.
              </p>
            </div>
          )}
        </motion.div>

        {/* Final Signals Card */}
        {(project.repository_quality !== undefined || project.collaborative_development !== undefined || project.engineering_signals || evaluation) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 rounded-[32px] border border-border bg-card p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-heading-sm mb-6">Engineering Signals</h2>

            {/* repository metrics first */}
            {(project.repository_quality !== undefined || project.collaborative_development !== undefined || project.engineering_signals) && (
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-body-sm">
                  {project.repository_quality !== undefined && (
                    <div className="p-2 bg-muted/10 rounded">
                      <span className="font-medium">Repository Quality:</span> {project.repository_quality}
                    </div>
                  )}
                  {project.collaborative_development !== undefined && (
                    <div className="p-2 bg-muted/10 rounded">
                      <span className="font-medium">Collaborative Development:</span> {project.collaborative_development}
                    </div>
                  )}
                  {project.engineering_signals &&
                    Object.entries(project.engineering_signals).map(([k, v]) => (
                      <div key={k} className="p-2 bg-muted/10 rounded">
                        <span className="font-medium capitalize">{k.replace(/_/g, ' ')}:</span> {String(v)}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* evaluation-based signals */}
            {evaluation && (
              <div className="space-y-2">
                {([
                  'code_quality_score',
                  'architecture_score',
                  'engineering_depth_score',
                  'commit_quality_score',
                  'production_readiness_score',
                ] as Array<keyof AIEvaluation>).map((key) => {
                  const score = evaluation[key] as number | undefined;
                  if (score === undefined) return null;
                  const isPrimary = key === config.primary;
                  const isSecondary = key === config.secondary;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span
                        className={`text-body-sm ${
                          isPrimary
                            ? 'font-bold text-primary'
                            : isSecondary
                            ? 'font-semibold text-secondary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {key
                          .replace('_score', '')
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      {isPrimary || isSecondary ? (
                        <div className="flex-1 mx-3 bg-muted/20 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isPrimary ? 'bg-primary' : 'bg-secondary'
                            } w-[${Math.round(score)}%]`}
                          />
                        </div>
                      ) : (
                        <span className="text-body-sm">{Math.round(score)}%</span>
                      )}
                    </div>
                  );
                })}
                {evaluation.production_readiness_score !== undefined && evaluation.production_readiness_score >= 70 && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Deployment / CI passing</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
}

function ScoreCard({ label, score }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900';
    if (score >= 70) return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900';
    return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900';
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`rounded-[24px] border-2 p-6 shadow-md hover:shadow-lg transition-all ${getScoreBg(score)}`}
    >
      <p className="text-caption font-medium text-muted-foreground mb-2">{label}</p>
      <p className={`text-display-xs font-bold ${getScoreColor(score)}`}>{score}</p>
    </motion.div>
  );
}

interface SignalItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function SignalItem({ icon: Icon, label, value }: SignalItemProps) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-[20px] bg-muted/30 p-5 shadow-sm hover:shadow-md hover:bg-muted/40 transition-all border border-border/50"
    >
      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-caption font-medium text-muted-foreground">{label}</p>
        <p className="text-body font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}

