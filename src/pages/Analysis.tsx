import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDeveloperAnalyzer, getDeveloperAnalyzerCharts, subscribeToAnalyzerStream, getCurrentDeveloper, getDeveloperProjects, evaluateProjectAI } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import type { DeveloperProfile, Project } from '@/types/api';

type AnalyzerPayload = Record<string, unknown>;

type LabeledValue = { label: string; value: number };

const NO_DATA_TEXT = 'Not enough analyzed projects yet.';

const DEFAULT_TOOLTIPS: Record<string, string> = {
  experience_signal:
    'Based on project complexity: Senior if at least 1 L3 project, Intermediate if at least 2 L2 projects, otherwise Junior.',
  verified_projects:
    'Number of projects marked as verified by the evaluation engine.',
  avg_confidence:
    'Average credibility/confidence score across analyzed projects (0–100).',
  contribution:
    'Distribution of Primary Builder / Major Contributor / Minor Contributor across analyzed projects.',
  system_complexity_score:
    'Weighted signal from architecture, engineering depth, and production readiness (0–10).',
  project_longevity:
    'Shows average/oldest project age and how many org-owned projects exceed the age threshold.',
};

const readNotes = (overview: Record<string, unknown>): Record<string, string> => {
  const notes = overview.calculation_notes;
  if (!notes || typeof notes !== 'object') return {};
  return notes as Record<string, string>;
};

const normalizeChartItems = (value: unknown): LabeledValue[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'object' && entry) {
          const row = entry as Record<string, unknown>;
          const label = String(row.label ?? row.name ?? row.key ?? row.x ?? '');
          const numeric = Number(row.value ?? row.y ?? row.count ?? row.percentage ?? 0);
          return { label, value: Number.isFinite(numeric) ? numeric : 0 };
        }
        return { label: '', value: 0 };
      })
      .filter((item) => item.label);
  }
  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;

    const nestedArray =
      (Array.isArray(objectValue.data) && objectValue.data) ||
      (Array.isArray(objectValue.items) && objectValue.items) ||
      (Array.isArray(objectValue.series) && objectValue.series) ||
      (Array.isArray(objectValue.values) && objectValue.values) ||
      (Array.isArray(objectValue.rows) && objectValue.rows) ||
      null;

    if (nestedArray) {
      return normalizeChartItems(nestedArray);
    }

    const labels = Array.isArray(objectValue.labels) ? objectValue.labels : null;
    const values = Array.isArray(objectValue.values) ? objectValue.values : null;
    if (labels && values && labels.length === values.length) {
      return labels
        .map((label, index) => ({ label: String(label || ''), value: Number(values[index]) || 0 }))
        .filter((item) => item.label);
    }

    return Object.entries(objectValue)
      .map(([label, raw]) => ({ label, value: Number(raw) || 0 }))
      .filter((item) => item.label);
  }
  return [];
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const pickFirst = (...values: unknown[]): unknown => values.find((value) => value !== undefined && value !== null);

const readNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const candidate = pickFirst(record.value, record.score, record.current, record.average, record.mean);
      if (candidate !== undefined) {
        const numeric = Number(candidate);
        if (Number.isFinite(numeric)) return numeric;
      }
    }
  }
  return 0;
};

const TooltipLabel = ({ text, tip }: { text: string; tip: string }) => (
  <div className="mb-2 flex items-center gap-2">
    <p className="text-body-sm text-muted-foreground">{text}</p>
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={`${text} info`}>
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">{tip}</TooltipContent>
    </Tooltip>
  </div>
);

const EmptyState = () => <p className="text-caption text-muted-foreground">{NO_DATA_TEXT}</p>;

export default function Analysis() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [charts, setCharts] = useState<unknown>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const location = useLocation();
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamCompletedRef = useRef(false);
  const hasAnalyzerDataRef = useRef(false);

  const params = new URLSearchParams(location.search);
  const devId = params.get('dev');
  const effectiveDevId = devId || developer?.id || null;

  const payload = (charts || {}) as AnalyzerPayload;
  const rawAnalyzerResponse = charts ? JSON.stringify(charts, null, 2) : null;
  const overview = ((payload.overview as Record<string, unknown>) || {}) as Record<string, unknown>;
  const notes = readNotes(overview);

  const normalizeAnalyzerPayload = (value: unknown): AnalyzerPayload | null => {
    if (!value || typeof value !== 'object') return null;

    const record = value as Record<string, unknown>;
    if (record.data && typeof record.data === 'object') {
      return record.data as AnalyzerPayload;
    }

    return record as AnalyzerPayload;
  };

  const complexityBreakdown = normalizeChartItems(pickFirst(payload.complexity_breakdown, payload.project_complexity_bar));
  const technologyUsage = normalizeChartItems(pickFirst(payload.technology_usage, payload.technology_usage_bar));
  const contributionLevel = asRecord(pickFirst(payload.contribution_level, payload.contribution_pie));
  const strengthAreas = normalizeChartItems(pickFirst(payload.strength_areas, payload.strengths_radar));
  const activityPattern = normalizeChartItems(pickFirst(payload.activity_pattern, payload.activity_timeline));
  const roleAlignment = asRecord(payload.role_alignment);
  const roleAlignmentRoles = normalizeChartItems(roleAlignment.detected_roles);
  const credibilityGauge = asRecord(payload.credibility_gauge);
  const hiringReadiness = asRecord(payload.hiring_readiness);
  const projectLongevity = asRecord(pickFirst(payload.project_longevity, hiringReadiness.project_longevity));

  const contributionPieItems = normalizeChartItems(payload.contribution_pie);

  const contributionDonut: LabeledValue[] = [
    {
      label: 'Primary Builder',
      value:
        readNumber(contributionLevel.primary_builder_pct, contributionLevel.primary_builder, contributionLevel.primary) ||
        readNumber(contributionLevel['Primary Builder']),
    },
    {
      label: 'Major Contributor',
      value:
        readNumber(contributionLevel.major_contributor_pct, contributionLevel.major_contributor, contributionLevel.major) ||
        readNumber(contributionLevel['Major Contributor']),
    },
    {
      label: 'Minor Contributor',
      value:
        readNumber(contributionLevel.minor_contributor_pct, contributionLevel.minor_contributor, contributionLevel.minor) ||
        readNumber(contributionLevel['Minor Contributor']),
    },
  ].filter((item) => item.value > 0 || contributionPieItems.length === 0);

  const mergedContributionDonut =
    contributionPieItems.length > 0
      ? contributionPieItems
      : contributionDonut.filter((item) => item.value > 0);

  const avgConfidence = readNumber(
    overview.average_confidence,
    payload.average_confidence,
    asRecord(payload.developer).average_confidence,
    asRecord(payload.credibility_gauge).average_confidence
  );
  const primaryBuilderPct = readNumber(
    overview.primary_builder_percentage,
    overview.primary_builder_pct,
    contributionLevel.primary_builder_pct,
    contributionLevel.primary_builder,
    contributionLevel.primary
  );
  const experienceSignal = String(
    pickFirst(
      overview.experience_signal,
      asRecord(payload.developer).experience_signal,
      asRecord(payload.hiring_readiness).experience_signal,
      'N/A'
    ) || 'N/A'
  );
  const verifiedProjects = readNumber(
    overview.verified_projects_count,
    overview.verified_projects,
    asRecord(payload.developer).verified_projects,
    asRecord(payload.hiring_readiness).verified_projects
  );
  const systemComplexityScore = readNumber(payload.system_complexity_score, payload.system_complexity_gauge);

  const nonArchivedProjects = projects.filter((project) => {
    const metadata = project.github_metadata as Record<string, unknown> | undefined;
    return metadata?.archived !== true;
  });
  const analyzedProjects = projects.filter((project) => {
    return !!project.ai_evaluation || project.evaluation_status === 'completed';
  });

  const bioLength = (developer?.bio || '').trim().length;
  const stackCount = Array.isArray(developer?.primary_stack) ? developer.primary_stack.length : 0;
  const readinessChecks = [
    {
      label: 'Name is set',
      pass: !!developer?.name?.trim(),
      fix: 'Add your full name in Edit Profile.',
    },
    {
      label: 'Primary role is set',
      pass: !!developer?.primary_role?.trim(),
      fix: 'Choose a primary role in Edit Profile.',
    },
    {
      label: 'Primary stack has at least 1 item',
      pass: stackCount >= 1,
      fix: 'Add at least one technology in Edit Profile.',
    },
    {
      label: 'Bio is between 200 and 1000 characters',
      pass: bioLength >= 200 && bioLength <= 1000,
      fix: `Update your bio length (${bioLength}/1000).`,
    },
    {
      label: 'At least 2 non-archived imported projects',
      pass: nonArchivedProjects.length >= 2,
      fix: 'Import more repositories (minimum 2 non-archived).',
    },
    {
      label: 'Profile is published/public',
      pass: developer?.is_published === true,
      fix: 'Publish your profile from the Dashboard action panel.',
    },
    {
      label: 'At least 1 project has AI evaluation',
      pass: analyzedProjects.length >= 1,
      fix: 'Run analysis/evaluate AI so at least one project has ai_evaluation.',
    },
  ];

  const missingReadinessItems = readinessChecks.filter((item) => !item.pass);
  const readinessComplete = missingReadinessItems.length === 0;
  const needsProfileFix =
    !readinessChecks[0].pass ||
    !readinessChecks[1].pass ||
    !readinessChecks[2].pass ||
    !readinessChecks[3].pass;
  const needsMoreProjects = !readinessChecks[4].pass;
  const needsPublish = !readinessChecks[5].pass;
  const needsAiEval = !readinessChecks[6].pass;

  useEffect(() => {
    hasAnalyzerDataRef.current = !!(
      charts &&
      typeof charts === 'object' &&
      Object.keys(charts as Record<string, unknown>).length > 0
    );
  }, [charts]);

  useEffect(() => {
    if (effectiveDevId) {
      getDeveloperAnalyzerCharts(effectiveDevId)
        .then((data) => {
          setCharts(data);
        })
        .catch((err) => {
        });
    }
  }, [effectiveDevId]);

  useEffect(() => {
    const loadReadiness = async () => {
      const resolvedDev = await getCurrentDeveloper();
      setDeveloper(resolvedDev);

      const analysisTargetId = devId || resolvedDev.id;

      try {
        const projectList = await getDeveloperProjects(analysisTargetId);
        setProjects(projectList || []);
      } catch {
        // keep panel resilient even if readiness fetch fails
      }
    };

    void loadReadiness();
  }, [devId, charts]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const logEndRef = useRef<HTMLLIElement | null>(null);

  const appendLog = useCallback((line: string) => {
    setLogLines((prev) => [...prev, line].slice(-200));
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

  const startStream = (id: string) => {
    streamCompletedRef.current = false;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    eventSourceRef.current = subscribeToAnalyzerStream(id, {
      onLog: (data) => {
        const text = `${data.step} - ${data.status}${data.detail ? `: ${data.detail}` : ''}`;
        appendLog(text);
        setAnalysisStatus(data.status);
      },
      onComplete: async (data) => {
        streamCompletedRef.current = true;
        appendLog('Analysis complete — refreshing charts...');
        setAnalysisStatus('complete');

        const streamPayload = normalizeAnalyzerPayload(data);
        if (streamPayload && Object.keys(streamPayload).length > 0) {
          setCharts(streamPayload);
        }

        try {
          const freshCharts = await getDeveloperAnalyzerCharts(id);
          setCharts(freshCharts);
        } catch {
          if (!streamPayload) {
            appendLog('Analysis completed, but final chart refresh failed.');
          }
        }

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        setRunning(false);
        toast({ title: 'Analysis complete', description: 'Charts and summary are refreshed.', });
      },
      onError: () => {
        if (streamCompletedRef.current) {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          return;
        }

        appendLog('Analysis stream disconnected before completion.');
        setRunning(false);

        if (!hasAnalyzerDataRef.current) {
          toast({ title: 'Analysis stream error', description: 'Unable to receive live updates.', variant: 'destructive' });
        }
      },
    });
  };

  const run = async () => {
    if (!effectiveDevId) {
      toast({ title: 'Missing developer context', description: 'Open analysis from dashboard so we can target the right profile.', variant: 'destructive' });
      return;
    }

    setRunning(true);
    setLogLines([]);
    setAnalysisStatus('starting');

    try {
      let triggered = false;

      try {
        await getDeveloperAnalyzer(effectiveDevId);
        appendLog('Developer-level analysis triggered. Waiting for updates...');
        triggered = true;
      } catch {
        appendLog('Developer-level trigger failed, attempting per-project AI evaluation fallback...');
      }

      if (!triggered && projects.length > 0) {
        const results = await Promise.allSettled(projects.map((project) => evaluateProjectAI(project.id)));
        const successCount = results.filter((result) => result.status === 'fulfilled').length;

        if (successCount > 0) {
          appendLog(`Triggered AI evaluation for ${successCount} project(s).`);
          triggered = true;
        }
      }

      if (!triggered) {
        throw new Error('No analysis trigger succeeded.');
      }

      startStream(effectiveDevId);
    } catch (err) {
      toast({ title: 'Analysis failed', description: 'Unable to run analysis, please try again.', variant: 'destructive' });
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-2xl px-4 text-center sm:px-6">
        <h1 className="text-display-sm mb-6">Profile Analyzer</h1>
        <p className="text-body mb-4">Run thorough AI evaluations across your imported repos.</p>
        <Button onClick={run} disabled={running} className="w-full gap-2 sm:w-auto">
          {running && <Loader2 className="h-4 w-4 animate-spin" />}
          {running ? 'Analyzing...' : 'Start Analysis'}
        </Button>
        <div className="mt-8">
          <Button variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">Back to Dashboard</Button>
        </div>
      </div>

      <div className="container mt-6 max-w-4xl px-4 sm:px-6">
        <details open={!readinessComplete} className="rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer list-none text-left">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-body-sm font-semibold">Analyzer readiness</p>
              <span className={`rounded-full px-2 py-1 text-caption ${readinessComplete ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                {readinessComplete ? 'Ready' : `${missingReadinessItems.length} missing requirement${missingReadinessItems.length === 1 ? '' : 's'}`}
              </span>
            </div>
          </summary>

          <div className="mt-3 space-y-3 text-left">
            <p className="text-body-sm text-muted-foreground">
              If you keep seeing “Not enough analyzed projects yet”, the most common cause is that imported projects exist but none has `ai_evaluation` yet.
            </p>

            <div className="space-y-2">
              {readinessChecks.map((item) => (
                <div key={item.label} className="flex flex-col gap-2 rounded-md border border-border/70 px-3 py-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-body-sm">{item.label}</p>
                    {!item.pass && <p className="text-caption text-muted-foreground">{item.fix}</p>}
                  </div>
                  <span className={`text-caption font-medium ${item.pass ? 'text-green-600' : 'text-yellow-600'}`}>
                    {item.pass ? 'OK' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-md bg-muted/30 p-3 text-caption text-muted-foreground">
              Stream state: {analysisStatus || 'idle'}. If it stays `idle`, the page is not currently consuming live updates from `/api/v1/developers/{'{id}'}/analyze-stream`.
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-4">
              {needsProfileFix && (
                <Button size="sm" variant="outline" onClick={() => navigate('/profile/edit')} className="w-full">
                  Fix Profile
                </Button>
              )}
              {needsMoreProjects && (
                <Button size="sm" variant="outline" onClick={() => navigate('/profile-setup?step=2')} className="w-full">
                  Import More Repos
                </Button>
              )}
              {needsPublish && (
                <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                  Go Publish Profile
                </Button>
              )}
              {needsAiEval && (
                <Button size="sm" onClick={run} disabled={running || !effectiveDevId} className="w-full">
                  {running ? 'Analyzing...' : 'Run Analysis Now'}
                </Button>
              )}
            </div>
          </div>
        </details>
      </div>

      <div className="container mt-4 max-w-4xl px-4 sm:px-6">
        <details className="rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer list-none text-left">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-body-sm font-semibold">Temporary Debug: Raw analyzer response</p>
              <span className="rounded-full bg-muted px-2 py-1 text-caption text-muted-foreground">
                {rawAnalyzerResponse ? 'payload received' : 'no payload yet'}
              </span>
            </div>
          </summary>

          <div className="mt-3 rounded-md bg-muted/20 p-3">
            {rawAnalyzerResponse ? (
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-caption text-foreground">
                {rawAnalyzerResponse}
              </pre>
            ) : (
              <p className="text-caption text-muted-foreground">
                No analyzer payload has been received yet. Run analysis to populate this panel.
              </p>
            )}
          </div>
        </details>
      </div>

      {/* Live log panel — always visible while running or after logs exist */}
      {(running || logLines.length > 0) && (
        <div className="container mt-6 max-w-2xl px-4 sm:px-6">
          <div className="mx-auto w-full rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-body-sm font-medium text-foreground">Live analyzer log</p>
              <span className="text-caption text-muted-foreground">
                Status: <span className={`font-medium ${
                  analysisStatus === 'complete' ? 'text-green-600' :
                  running ? 'text-primary' :
                  'text-muted-foreground'
                }`}>{analysisStatus || 'idle'}</span>
              </span>
            </div>
            <div className="h-52 overflow-y-auto rounded-xl bg-muted/10 p-3 text-xs font-mono">
              {logLines.length === 0 ? (
                <p className="text-muted-foreground">Starting analysis…</p>
              ) : (
                <ul className="space-y-1">
                  {logLines.map((line, idx) => (
                    <li key={idx} className="break-words leading-relaxed">
                      <span className="mr-2 select-none text-muted-foreground/40">{String(idx + 1).padStart(2, '0')}</span>
                      {line}
                    </li>
                  ))}
                  <li ref={logEndRef} />
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results area */}
      {!running && (
        <div className="container mt-12 max-w-6xl px-4 sm:px-6">
          <h2 className="text-heading-md mb-4">Recent Analysis</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel
                  text="Experience Signal"
                  tip={notes.experience_signal || DEFAULT_TOOLTIPS.experience_signal}
                />
                <p className="text-heading-sm">{experienceSignal || NO_DATA_TEXT}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel
                  text="Verified Projects"
                  tip={notes.verified_projects || DEFAULT_TOOLTIPS.verified_projects}
                />
                <p className="text-heading-sm">{Number.isFinite(verifiedProjects) ? verifiedProjects : NO_DATA_TEXT}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel
                  text="Avg Confidence"
                  tip={notes.avg_confidence || DEFAULT_TOOLTIPS.avg_confidence}
                />
                <p className="text-heading-sm">
                  {Number.isFinite(avgConfidence) && avgConfidence > 0 ? `${Math.round(avgConfidence)}%` : NO_DATA_TEXT}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel
                  text="Contribution"
                  tip={notes.contribution || DEFAULT_TOOLTIPS.contribution}
                />
                <p className="text-heading-sm">
                  {Number.isFinite(primaryBuilderPct) && primaryBuilderPct > 0 ? `${Math.round(primaryBuilderPct)}% primary` : NO_DATA_TEXT}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel
                  text="System Complexity Score"
                  tip={notes.system_complexity_score || DEFAULT_TOOLTIPS.system_complexity_score}
                />
                <p className="text-heading-sm">
                  {Number.isFinite(systemComplexityScore) && systemComplexityScore > 0 ? `${systemComplexityScore.toFixed(1)}/10` : NO_DATA_TEXT}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel
                  text="Project Longevity"
                  tip={notes.project_longevity || DEFAULT_TOOLTIPS.project_longevity}
                />
                {Number(projectLongevity.average_project_age_years) > 0 ? (
                  <p className="text-body-sm">
                    Avg {Number(projectLongevity.average_project_age_years).toFixed(1)}y • Oldest {Number(projectLongevity.oldest_project_age_years || 0).toFixed(1)}y
                  </p>
                ) : (
                  <EmptyState />
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Project Complexity (Bar)" tip="complexity_breakdown → x: L1/L2/L3, y: counts." />
                {complexityBreakdown.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {complexityBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-caption">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <Progress className="h-2 bg-muted/20" value={Math.min(item.value * 10, 100)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Technology Usage (Horizontal Bar)" tip="technology_usage → x: percentage, y: name." />
                {technologyUsage.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {technologyUsage.slice(0, 8).map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-caption">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <Progress className="h-2 bg-muted/20" value={Math.min(item.value, 100)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Contribution (Donut)" tip="contribution_level.primary_builder_pct, major_contributor_pct, minor_contributor_pct." />
                {mergedContributionDonut.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {mergedContributionDonut.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-body-sm">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Credibility (Gauge)" tip="credibility_gauge.score (0–10), subtitle from credibility_gauge.level." />
                {Number(credibilityGauge.score) > 0 ? (
                  <>
                    <p className="text-heading-sm">{Number(credibilityGauge.score).toFixed(1)}/10</p>
                    <p className="text-caption text-muted-foreground">{String(credibilityGauge.level || '')}</p>
                  </>
                ) : (
                  <EmptyState />
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Strength Areas (Radar)" tip="strength_areas 5 axes (api_development, database_design, system_architecture, performance_optimization, testing)." />
                {strengthAreas.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {strengthAreas.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-body-sm">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Activity Pattern (Line/Bar)" tip="activity_pattern year → project count." />
                {activityPattern.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {activityPattern.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-caption">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <Progress className="h-2 bg-muted/20" value={Math.min(item.value * 10, 100)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Role Alignment (Stacked Bar)" tip="role_alignment.detected_roles, with badge text from claimed_role and alignment_score." />
                {roleAlignmentRoles.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <p className="mb-2 text-caption text-muted-foreground">
                      Claimed role: {String(roleAlignment.claimed_role || 'N/A')} • Alignment: {String(roleAlignment.alignment_score ?? 'N/A')}
                    </p>
                    <div className="space-y-1">
                      {roleAlignmentRoles.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-body-sm">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <TooltipLabel text="Project Longevity (Card/mini chart)" tip="project_longevity.average_project_age_years, oldest_project_age_years, organization_projects_over_threshold, note." />
                {Number(projectLongevity.average_project_age_years) > 0 ? (
                  <div className="space-y-1 text-body-sm">
                    <p>Average age: {Number(projectLongevity.average_project_age_years).toFixed(1)} years</p>
                    <p>Oldest age: {Number(projectLongevity.oldest_project_age_years || 0).toFixed(1)} years</p>
                    <p>Org projects over threshold: {Number(projectLongevity.organization_projects_over_threshold || 0)}</p>
                    {projectLongevity.note && <p className="text-caption text-muted-foreground">{String(projectLongevity.note)}</p>}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
