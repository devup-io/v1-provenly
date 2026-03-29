import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, RefreshCw, Info, AlertTriangle, TrendingUp, Lightbulb, Zap, CheckCircle2, X, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDeveloperAnalyzer, getDeveloperAnalyzerCharts, subscribeToAnalyzerStream, getCurrentDeveloper, getDeveloperProjects, evaluateProjectAI } from '@/lib/api';
import type { DeveloperProfile, Project } from '@/types/api';


import '../styles/analyzer-theme.css';

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
    <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={`${text} info`} title={tip}>
      <Info className="h-4 w-4" />
    </button>
  </div>
);

const EmptyState = () => <p className="text-caption text-muted-foreground">{NO_DATA_TEXT}</p>;

export default function Analysis() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [modalStep, setModalStep] = useState<'checking' | 'logs' | 'ready' | 'results' | null>(null);
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

  const complexityBreakdown = normalizeChartItems(
    pickFirst(payload.complexity_breakdown, payload.project_complexity_bar, payload.project_complexity, payload.complexity)
  );
  const technologyUsage = normalizeChartItems(pickFirst(payload.technology_usage, payload.technology_usage_bar, payload.tech_usage));
  const contributionLevel = asRecord(pickFirst(payload.contribution_level, payload.contribution_pie, payload.contribution));
  const strengthAreas = normalizeChartItems(pickFirst(payload.strength_areas, payload.strengths_radar, payload.strengths));
  const activityPattern = normalizeChartItems(pickFirst(payload.activity_pattern, payload.activity_timeline, payload.activity));
  const roleAlignment = asRecord(pickFirst(payload.role_alignment, payload.roleAlignment));
  const roleAlignmentRoles = normalizeChartItems(roleAlignment.detected_roles);
  const credibilityGauge = asRecord(pickFirst(payload.credibility_gauge, payload.credibilityGauge));
  const hiringReadiness = asRecord(pickFirst(payload.hiring_readiness, payload.hiringReadiness));
  const projectLongevity = asRecord(pickFirst(payload.project_longevity, payload.projectLongevity, hiringReadiness.project_longevity));

  const contributionPieItems = normalizeChartItems(pickFirst(payload.contribution_pie, payload.contributionPie));

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
    overview.avg_confidence,
    asRecord(payload.credibility_gauge).average_confidence,
    asRecord(payload.credibility_gauge).confidence,
    asRecord(payload.credibility_gauge).score,
    payload.average_confidence,
    asRecord(payload.developer).average_confidence
  );
  const primaryBuilderPct = readNumber(
    overview.primary_builder_percentage,
    overview.primary_builder_pct,
    asRecord(payload.contribution_level).primary_builder_pct,
    asRecord(payload.contribution_level).primary_builder_percentage,
    asRecord(payload.contribution_pie).primary_builder_pct,
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
    overview.total_verified_projects,
    asRecord(payload.developer).verified_projects,
    asRecord(payload.hiring_readiness).verified_projects
  );
  const systemComplexityScore = readNumber(
    payload.system_complexity_score,
    payload.system_complexity_gauge,
    payload.systemComplexityScore,
    asRecord(payload.system_complexity_gauge).score
  );

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
          setCharts(normalizeAnalyzerPayload(data) || data);
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
    setModalStep('checking');

    try {
      let triggered = false;

      // Simulate status check modal
      setTimeout(() => setModalStep('logs'), 1200);

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

      // Simulate logs modal, then ready modal
      setTimeout(() => setModalStep('ready'), 2200);

      startStream(effectiveDevId);
    } catch (err) {
      toast({ title: 'Analysis failed', description: 'Unable to run analysis, please try again.', variant: 'destructive' });
      setRunning(false);
      setModalStep(null);
    }
  };
  // Helper color tokens (should match analyzer-theme.css)
  const D = {
    purple: 'var(--an-purple)',
    purpleDim: 'var(--an-purple-dim)',
    green: 'var(--an-green)',
    greenDim: 'var(--an-green-dim)',
    amber: 'var(--an-amber)',
    amberDim: 'var(--an-amber-dim)',
    blue: 'var(--an-blue)',
    blueDim: 'var(--an-blue-dim)',
    coral: 'var(--an-coral)',
    coralDim: 'var(--an-coral-dim)',
    pink: 'var(--an-pink)',
    surface: 'var(--an-surface)',
    surfaceEl: 'var(--an-surface-el)',
    border: 'var(--an-border)',
    borderMid: 'var(--an-border-mid)',
    text: 'var(--an-text)',
    muted: 'var(--an-muted)',
    mutedMid: 'var(--an-muted-mid)',
  };
  const CONTRIB_COLORS = [D.purple, D.green, D.amber];

  // Sub-components (inlined for brevity)
  function ScoreRing({ score }) {
    const r = 54, circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);
    return (
      <div className="score-ring">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke={D.surfaceEl} strokeWidth="10" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={D.purple} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <div className="score-ring-center">
          <span className="score-ring-value">{readNumber(overview.health_score, overview.profile_score, overview.score, 0)}</span>
          <span className="score-ring-max">/100</span>
        </div>
      </div>
    );
  }
  function BreakdownBar({ label, value, color }) {
    return (
      <div className="breakdown-bar">
        <span className="breakdown-bar-label">{label}</span>
        <div className="breakdown-bar-row">
          <div className="breakdown-bar-bg">
            <div className="breakdown-bar-fill" style={{ width: `${value}%`, background: color }} />
          </div>
          <span className="breakdown-bar-value">{value}</span>
        </div>
      </div>
    );
  }
  function Card({ children, style={} }) {
    return (
      <div className="an-card" style={style}>
        {children}
      </div>
    );
  }
  function CardHeader({ icon, iconBg, title }) {
    return (
      <div className="an-card-header">
        <div className="an-card-header-icon" style={{ background: iconBg }}>{icon}</div>
        <span className="an-card-header-title">{title}</span>
      </div>
    );
  }
  function StatCard({ label, value, sub }) {
    return (
      <div className="stat-card">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    );
  }
  function InsightItem({ dot, text }) {
    return (
      <div className="insight-item">
        <div className="insight-dot" style={{ background: dot }} />
        <span>{text}</span>
      </div>
    );
  }
  function GapItem({ text }) {
    return (
      <div className="gap-item">
        <AlertTriangle size={14} className="gap-icon" style={{ color: D.coral }} />
        <span>{text}</span>
      </div>
    );
  }
  function SuggestionItem({ num, text }) {
    return (
      <div className="suggestion-item">
        <div className="suggestion-num">{num}</div>
        <span>{text}</span>
      </div>
    );
  }
  function ProgressBar({ label, value, max, color, unit='' }) {
    return (
      <div className="progress-bar">
        <div className="progress-bar-row">
          <span className="progress-bar-label">{label}</span>
          <span className="progress-bar-value">{value}{unit}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${Math.min(100,(value/max)*100)}%`, background: color }} />
        </div>
      </div>
    );
  }
  function ActivityRow({ label, val }) {
    return (
      <div className="activity-row">
        <span className="activity-label">{label}</span>
        <span className="activity-value">{val}</span>
      </div>
    );
  }

  // Extracted backend data for each section
  const healthScore = readNumber(overview.health_score, overview.profile_score, overview.score, 0);
  const breakdowns = [
    { label: 'Project Quality', value: readNumber(overview.project_quality, overview.quality_score), color: D.purple },
    { label: 'Contribution', value: readNumber(overview.contribution, overview.contribution_score), color: D.green },
    { label: 'Consistency', value: readNumber(overview.consistency, overview.consistency_score), color: D.amber },
    { label: 'Role Alignment', value: readNumber(overview.role_alignment, overview.role_alignment_score), color: D.blue },
  ];
  const keyInsights = Array.isArray(payload.insights) ? payload.insights : [];
  const gaps = Array.isArray(payload.gaps) ? payload.gaps : [];
  const suggestions = Array.isArray(payload.suggestions) ? payload.suggestions : [];
  const activityStats = Array.isArray(payload.activity_stats) ? payload.activity_stats : [];
  // fallback for activity
  const activityRows = activityStats.length ? activityStats : [
    { label: 'Last active', val: overview.last_active },
    { label: 'Projects this month', val: overview.projects_this_month },
    { label: 'Projects this year', val: overview.projects_this_year },
    { label: 'Avg project age', val: overview.avg_project_age },
    { label: 'Oldest project', val: overview.oldest_project },
  ].filter(a => a.val);

  // Main render
  return (
    <div className="analyzer-root">
      {/* Header */}
      <div className="analyzer-header">
        <div className="analyzer-header-title">
          <span className="analyzer-title-text">Profile Analyzer</span>
          <span className="analyzer-title-badge">AI Coach</span>
        </div>
        <button onClick={run} disabled={running} className="analyzer-refresh-btn">
          {running ? <Loader2 size={14} style={{ animation: 'pa-spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
          {running ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Health Score Hero */}
      <div className="an-health-hero">
        <ScoreRing score={healthScore} />
        <div>
          <div className="an-health-title">Profile Strength</div>
          <div className="an-breakdown-grid">
            {breakdowns.map(b => <BreakdownBar key={b.label} {...b} />)}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="an-quick-stats">
        <StatCard label="Experience" value={experienceSignal} sub="Complexity signals" />
        <StatCard label="Avg Confidence" value={avgConfidence ? `${avgConfidence}%` : '—'} sub="Across projects" />
        <StatCard label="Verified" value={verifiedProjects} sub="of imported" />
        <StatCard label="Complexity" value={systemComplexityScore ? `${systemComplexityScore}/10` : '—'} sub="Architecture score" />
      </div>

      {/* Insights + Gaps */}
      <div className="an-insights-gaps">
        <Card>
          <CardHeader icon={<Info size={15} color={D.purple} />} iconBg={D.purpleDim} title="Key Insights" />
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {keyInsights.length ? keyInsights.map((ins, i) => <InsightItem key={i} dot={D.purple} text={ins} />) : <EmptyState />}
          </div>
        </Card>
        <Card>
          <CardHeader icon={<AlertTriangle size={15} color={D.coral} />} iconBg={D.coralDim} title="Issues & Gaps" />
          {gaps.length ? gaps.map((g, i) => <GapItem key={i} text={g} />) : <EmptyState />}
        </Card>
      </div>

      {/* Suggestions + Activity */}
      <div className="an-suggestions-activity">
        <Card>
          <CardHeader icon={<Lightbulb size={15} color={D.green} />} iconBg={D.greenDim} title="Actionable Suggestions" />
          {suggestions.length ? suggestions.map((s, i) => <SuggestionItem key={i} num={i+1} text={s} />) : <EmptyState />}
        </Card>
        <Card>
          <CardHeader icon={<TrendingUp size={15} color={D.green} />} iconBg={D.greenDim} title="Growth & Activity" />
          {activityRows.length ? activityRows.map((a, i) => <ActivityRow key={i} label={a.label} val={a.val} />) : <EmptyState />}
          {activityPattern.length > 0 && (
            <div style={{ marginTop:'1rem' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', color:D.muted, marginBottom:'0.75rem' }}>Activity by Year</div>
              {activityPattern.map(a => (
                <ProgressBar key={a.label} label={a.label} value={a.value} max={5} color={D.green} unit=" projects" />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row */}
      <div className="an-charts-row">
        <Card>
          <CardHeader icon={<Zap size={15} color={D.amber} />} iconBg={D.amberDim} title="Project Complexity" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={complexityBreakdown} barSize={28}>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} />
              <Bar dataKey="value" radius={[8,8,0,0]}>
                {complexityBreakdown.map((_,i)=><Cell key={i} fill={['#5a53c4','#7F77DD','#a49ef0'][i]||D.purple}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader icon={<Info size={15} color={D.blue} />} iconBg={D.blueDim} title="Tech Usage" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={technologyUsage} layout="vertical" barSize={18}>
              <XAxis type="number" tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} domain={[0,100]} />
              <YAxis dataKey="label" type="category" tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} width={52} />
              <Bar dataKey="value" radius={[0,8,8,0]}>
                {technologyUsage.map((_,i)=><Cell key={i} fill={[D.blue,'#2a6eb5'][i]||D.blue}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader icon={<Info size={15} color={D.purple} />} iconBg={D.purpleDim} title="Contribution Split" />
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={mergedContributionDonut} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                {mergedContributionDonut.map((_,i)=><Cell key={i} fill={CONTRIB_COLORS[i]||'#ccc'}/>)}
              </Pie>
              <RechartsTooltip
                contentStyle={{ background:D.surfaceEl, border:`1px solid ${D.border}`, borderRadius:10, color:D.text, fontSize:12 }}
                formatter={(val,name)=>[`${val}%`,name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="an-contrib-legend">
            {mergedContributionDonut.map((c,i)=>(
              <span key={i} className="an-contrib-legend-item">
                <span className="an-contrib-legend-dot" style={{ background: CONTRIB_COLORS[i] }}/>
                {c.label.replace(' Builder','').replace(' Contributor','')} {c.value}%
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Strength + Role */}
      <div className="an-strength-role">
        <Card>
          <CardHeader icon={<Zap size={15} color={D.green} />} iconBg={D.greenDim} title="Strength Areas" />
          {strengthAreas.length ? strengthAreas.map(s=>(
            <ProgressBar key={s.label} label={s.label} value={s.value} max={10} color={D.purple} unit="/10" />
          )) : <EmptyState />}
        </Card>
        <Card>
          <CardHeader icon={<Info size={15} color={D.pink} />} iconBg="rgba(232,96,138,0.15)" title="Role Alignment" />
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:D.muted, marginBottom:4 }}>Claimed role</div>
            <div style={{ fontSize:14, fontWeight:600, color:D.text }}>{String(roleAlignment.claimed_role || '')}</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:D.muted, marginBottom:6 }}>Alignment score</div>
            <div style={{ height:10, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
              <div style={{ width:`${(Number(roleAlignment.alignment_score || 0)/10)*100}%`, height:'100%', borderRadius:99, background:D.pink }} />
            </div>
            <div style={{ fontSize:12, fontWeight:600, marginTop:4, color:D.text }}>{Number(roleAlignment.alignment_score || 0)}/10</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {roleAlignmentRoles.length ? roleAlignmentRoles.map(r=>(
              <div key={String(r.label)} style={{ flex:1, borderRadius:12, background:D.surfaceEl, border:`1px solid ${D.border}`, padding:10, textAlign:'center' }}>
                <div style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:700, color:D.text }}>{Number(r.value)}</div>
                <div style={{ fontSize:11, color:D.muted }}>{String(r.label)}</div>
              </div>
            )) : <EmptyState />}
          </div>
        </Card>
      </div>
    </div>
  );
}
