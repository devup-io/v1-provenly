import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Github,
  Star,
  GitBranch,
  Code2,
  Globe,
  TrendingUp,
  Loader2,
  AlertCircle,
  BarChart3,
  Zap,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getDeveloperProjects } from '@/lib/api';
import type { Project, AIEvaluation } from '@/types/api';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openedFromDevelopers = new URLSearchParams(location.search).get('from') === 'developers';
  const backPath = openedFromDevelopers ? '/developers' : '/dashboard';
  const backLabel = openedFromDevelopers ? '← Back to Developers' : '← Back to Dashboard';
  const [aiSignalModal, setAiSignalModal] = useState<{
    type: 'repo_score' | 'confidence_score' | 'contribution_percentage';
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
      tooltip: 'How confident the AI is in this repository evaluation.',
      explain: (value: number) =>
        value >= 80
          ? 'Very high confidence in this evaluation.'
          : value >= 60
            ? 'Good confidence in this evaluation.'
            : 'Lower confidence due to limited available signals.',
    },
    contribution_percentage: {
      title: 'Contribution Percentage',
      tooltip: 'Estimated share of contribution by the developer.',
      explain: (value: number) =>
        value >= 70
          ? 'Primary builder role in this repository.'
          : value >= 40
            ? 'Major contributor role in this repository.'
            : 'Minor or partial contributor role in this repository.',
    },
  } as const;

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
          <Button variant="outline" onClick={() => navigate(backPath)} className="mb-6">
            {backLabel}
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
  const metadata = project.github_metadata as Record<string, unknown> | undefined;
  const detectedTypeValue =
    evaluation?.detected_project_type ||
    (typeof metadata?.detected_project_type === 'string' ? metadata.detected_project_type : null) ||
    (typeof metadata?.project_type === 'string' ? metadata.project_type : null) ||
    'N/A';
  const evaluationProfileValue =
    evaluation?.evaluation_profile ||
    (typeof metadata?.evaluation_profile === 'string' ? metadata.evaluation_profile : null) ||
    'N/A';

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

  const projectType = detectedTypeValue !== 'N/A' ? detectedTypeValue : evaluationProfileValue !== 'N/A' ? evaluationProfileValue : '';
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
            <Button variant="outline" onClick={() => navigate(backPath)}>
              {backLabel}
            </Button>
          </div>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-display-sm">{project.name}</h1>
              <div className="flex flex-wrap gap-2">
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

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {evaluation?.difficulty_tier && (
                <span className="rounded-full bg-pastel-yellow px-3 py-1 text-body-sm font-semibold text-pastel-yellow-foreground">
                  {evaluation.difficulty_tier}
                  {evaluation.difficulty_tier === 'Beginner'
                    ? ' (L1)'
                    : evaluation.difficulty_tier === 'Intermediate'
                    ? ' (L2)'
                    : evaluation.difficulty_tier === 'Advanced'
                    ? ' (L3)'
                    : ''}
                </span>
              )}
              {project.evaluation_status && (
                <span className="rounded-full bg-secondary px-3 py-1 text-body-sm font-semibold text-secondary-foreground">
                  {project.evaluation_status.replace(/_/g, ' ')}
                  {project.evaluation_status === 'completed' ? ' project' : ''}
                </span>
              )}
            </div>

            {project.description && (
              <p className="mb-4 text-body text-muted-foreground">{project.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-body-sm text-muted-foreground md:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <p className="text-caption uppercase tracking-wide">Language</p>
                <p className="font-medium text-foreground">{project.language || 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <p className="text-caption uppercase tracking-wide">Stars</p>
                <p className="font-medium text-foreground">{project.stars ?? 0} stars</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <p className="text-caption uppercase tracking-wide">Forks</p>
                <p className="font-medium text-foreground">{project.forks ?? 0} forks</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <p className="text-caption uppercase tracking-wide">Updated</p>
                <p className="font-medium text-foreground">
                  {project.last_updated ? new Date(project.last_updated).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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
                <p className="font-semibold">{detectedTypeValue}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                <p className="text-caption text-muted-foreground">Evaluation Profile</p>
                <p className="font-semibold">{evaluationProfileValue}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                <p className="text-caption text-muted-foreground">Role Alignment</p>
                <p className="font-semibold">{evaluation?.primary_role_alignment || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-3">
              <p className="text-caption text-muted-foreground">Project Classification</p>
              <p className="text-body-sm font-medium text-foreground">
                {detectedTypeValue !== 'N/A' ? detectedTypeValue : evaluationProfileValue} project
              </p>
            </div>
          </div>
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
                <ScoreCard
                  label="Overall Score"
                  score={evaluation.repo_score}
                  tooltip={signalInfo.repo_score.tooltip}
                  onViewMore={() => setAiSignalModal({ type: 'repo_score', value: Number(evaluation.repo_score) })}
                />
                <ScoreCard
                  label="Engineering Depth"
                  score={evaluation.engineering_depth_score ?? 0}
                  tooltip="Depth of implementation complexity and engineering sophistication."
                  onViewMore={() => setAiSignalModal({ type: 'repo_score', value: Number(evaluation.engineering_depth_score ?? 0) })}
                />
                <ScoreCard
                  label="Architecture Quality"
                  score={evaluation.architecture_score ?? 0}
                  tooltip="How well the project structure and system design are organized."
                  onViewMore={() => setAiSignalModal({ type: 'repo_score', value: Number(evaluation.architecture_score ?? 0) })}
                />
                <ScoreCard
                  label="Code Quality"
                  score={evaluation.code_quality_score ?? 0}
                  tooltip="Readability, maintainability, and quality of source code implementation."
                  onViewMore={() => setAiSignalModal({ type: 'repo_score', value: Number(evaluation.code_quality_score ?? 0) })}
                />
                <ScoreCard
                  label="Production Readiness"
                  score={evaluation.production_readiness_score ?? 0}
                  tooltip="Readiness for deployment and operating in real production environments."
                  onViewMore={() => setAiSignalModal({ type: 'repo_score', value: Number(evaluation.production_readiness_score ?? 0) })}
                />
                <ScoreCard
                  label="Commit Quality"
                  score={evaluation.commit_quality_score ?? 0}
                  tooltip="Quality and consistency of commit history and development workflow."
                  onViewMore={() => setAiSignalModal({ type: 'repo_score', value: Number(evaluation.commit_quality_score ?? 0) })}
                />
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

        <Dialog open={!!aiSignalModal} onOpenChange={(open) => !open && setAiSignalModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{aiSignalModal ? signalInfo[aiSignalModal.type].title : 'AI Signal'}</DialogTitle>
              <DialogDescription>{project.name}</DialogDescription>
            </DialogHeader>
            {aiSignalModal && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-caption text-muted-foreground">Value</p>
                  <p className="text-display-xs font-bold">{Math.round(aiSignalModal.value)}%</p>
                </div>
                <p className="text-body-sm text-muted-foreground">{signalInfo[aiSignalModal.type].tooltip}</p>
                <p className="text-body-sm">{signalInfo[aiSignalModal.type].explain(aiSignalModal.value)}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  tooltip?: string;
  onViewMore?: () => void;
}

function ScoreCard({ label, score, tooltip, onViewMore }: ScoreCardProps) {
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
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-caption font-medium text-muted-foreground">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={`About ${label}`}>
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className={`text-display-xs font-bold ${getScoreColor(score)}`}>{score}</p>
      {onViewMore && (
        <button type="button" className="mt-2 text-caption font-medium text-primary hover:underline" onClick={onViewMore}>
          View more
        </button>
      )}
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

