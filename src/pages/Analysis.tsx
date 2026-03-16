import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { getDeveloperAnalyzer, getDeveloperAnalyzerCharts, getDeveloperSummary, subscribeToAnalyzerStream } from '@/lib/api';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

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
    return Object.entries(value as Record<string, unknown>)
      .map(([label, raw]) => ({ label, value: Number(raw) || 0 }))
      .filter((item) => item.label);
  }
  return [];
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
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<unknown>(null);
  const [charts, setCharts] = useState<unknown>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const eventSourceRef = useRef<EventSource | null>(null);

  const params = new URLSearchParams(location.search);
  const devId = params.get('dev');

  const payload = (charts || {}) as AnalyzerPayload;
  const overview = ((payload.overview as Record<string, unknown>) || {}) as Record<string, unknown>;
  const notes = readNotes(overview);

  const complexityBreakdown = normalizeChartItems(payload.complexity_breakdown);
  const technologyUsage = normalizeChartItems(payload.technology_usage);
  const contributionLevel = ((payload.contribution_level as Record<string, unknown>) || {}) as Record<string, unknown>;
  const strengthAreas = normalizeChartItems(payload.strength_areas);
  const activityPattern = normalizeChartItems(payload.activity_pattern);
  const roleAlignment = ((payload.role_alignment as Record<string, unknown>) || {}) as Record<string, unknown>;
  const roleAlignmentRoles = normalizeChartItems(roleAlignment.detected_roles);
  const credibilityGauge = ((payload.credibility_gauge as Record<string, unknown>) || {}) as Record<string, unknown>;
  const projectLongevity = ((payload.project_longevity as Record<string, unknown>) || {}) as Record<string, unknown>;

  const contributionDonut: LabeledValue[] = [
    { label: 'Primary Builder', value: Number(contributionLevel.primary_builder_pct) || 0 },
    { label: 'Major Contributor', value: Number(contributionLevel.major_contributor_pct) || 0 },
    { label: 'Minor Contributor', value: Number(contributionLevel.minor_contributor_pct) || 0 },
  ].filter((item) => item.value > 0);

  const avgConfidence = Number(overview.average_confidence);
  const primaryBuilderPct = Number(overview.primary_builder_percentage);
  const experienceSignal = String(overview.experience_signal || 'N/A');
  const verifiedProjects = Number(overview.verified_projects_count ?? overview.verified_projects ?? 0);
  const systemComplexityScore = Number(payload.system_complexity_score ?? payload.system_complexity_gauge ?? 0);

  useEffect(() => {
    if (devId) {
      getDeveloperSummary(devId)
        .then((data) => {
          setSummary(data);
        })
        .catch((err) => {
        });

      getDeveloperAnalyzerCharts(devId)
        .then((data) => {
          setCharts(data);
        })
        .catch((err) => {
        });
    }
  }, [devId]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const appendLog = (line: string) => {
    setLogLines((prev) => [...prev, line].slice(-50));
  };

  const startStream = (id: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    eventSourceRef.current = subscribeToAnalyzerStream(id, {
      onLog: (data) => {
        const text = `${data.step} - ${data.status}${data.detail ? `: ${data.detail}` : ''}`;
        appendLog(text);
        setAnalysisStatus(data.status);
      },
      onComplete: async () => {
        appendLog('Analysis complete — refreshing charts...');
        setAnalysisStatus('complete');
        if (devId) {
          const freshCharts = await getDeveloperAnalyzerCharts(devId);
          setCharts(freshCharts);
        }
        setRunning(false);
        toast({ title: 'Analysis complete', description: 'Charts and summary are refreshed.', });
      },
      onError: (err) => {
        appendLog('Analysis stream error — please try again.');
        setRunning(false);
        toast({ title: 'Analysis stream error', description: 'Unable to receive live updates.', variant: 'destructive' });
      },
    });
  };

  const run = async () => {
    if (!devId) return;
    setRunning(true);
    setLogLines([]);
    setAnalysisStatus('starting');

    try {
      await getDeveloperAnalyzer(devId);
      appendLog('Analysis triggered. Waiting for updates...');
      startStream(devId);
    } catch (err) {
      toast({ title: 'Analysis failed', description: 'Unable to run analysis, please try again.', variant: 'destructive' });
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-2xl text-center">
        <h1 className="text-display-sm mb-6">Profile Analyzer</h1>
        <p className="text-body mb-4">Run thorough AI evaluations across your imported repos.</p>
        <Button onClick={run} disabled={running} className="gap-2">
          {running && <Loader2 className="h-4 w-4 animate-spin" />}
          {running ? 'Analyzing...' : 'Start Analysis'}
        </Button>
        <div className="mt-8">
          <Button variant="outline" onClick={() => window.history.back()}>Back to Dashboard</Button>
        </div>
      </div>

      {/* Results area */}
      {!running && (
        <div className="container mt-12 max-w-6xl">
          <h2 className="text-heading-md mb-4">Recent Analysis</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-body-sm text-muted-foreground mb-2">Live analyzer status</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-body-sm">Status: <span className="font-medium">{analysisStatus || 'idle'}</span></span>
                {running && <span className="text-body-sm text-muted-foreground">Updating in real-time...</span>}
              </div>
              <div className="mt-4 max-h-40 overflow-y-auto rounded-lg bg-muted/10 p-3 text-xs">
                {logLines.length === 0 ? (
                  <p className="text-muted-foreground">No log output yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {logLines.map((line, idx) => (
                      <li key={idx} className="break-words">{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

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
                {contributionDonut.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-2">
                    {contributionDonut.map((item) => (
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

            {summary && (
              <div className="mt-2 p-4 rounded-lg border border-border bg-card">
                <h3 className="text-heading-sm mb-2">Developer Summary Data</h3>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
