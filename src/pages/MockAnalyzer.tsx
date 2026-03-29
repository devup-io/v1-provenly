import { useState, useRef, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import {
  Loader2, RefreshCw, Info, AlertTriangle,
  TrendingUp, Lightbulb, Zap, CheckCircle2,
  X, ChevronDown, ChevronUp, Terminal,
} from 'lucide-react';

// ─── Design tokens (dark) ─────────────────────────────────────────────────────
const D = {
  bg:        '#0d0d0f',
  surface:   '#131316',
  surfaceEl: '#1a1a1e',
  border:    'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  text:      '#f0f0f2',
  muted:     '#6b6b75',
  mutedMid:  '#9494a0',
  purple:    '#8b82f0',
  purpleDim: '#2a2640',
  purpleBg:  '#1d1a30',
  green:     '#34c780',
  greenDim:  '#162a20',
  greenBg:   '#0f1f17',
  amber:     '#f5a623',
  amberDim:  '#2a1f0a',
  blue:      '#4a9eff',
  blueDim:   '#0f1e30',
  coral:     '#ff6b4a',
  coralDim:  '#2a1510',
  pink:      '#e8608a',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const MOCK_CHARTS = {
  complexity_breakdown: [{ label:'L1',value:2 },{ label:'L2',value:1 },{ label:'L3',value:1 }],
  technology_usage:     [{ label:'React',value:60 },{ label:'Node.js',value:40 }],
  strength_areas:       [{ label:'API Development',value:8 },{ label:'System Architecture',value:7 },{ label:'Testing',value:6 }],
  activity_pattern:     [{ label:'2024',value:2 },{ label:'2025',value:3 }],
  role_alignment:       { claimed_role:'Full Stack Developer', alignment_score:9, detected_roles:[{ label:'Frontend',value:5 },{ label:'Backend',value:4 }] },
  contribution_pie:     [{ label:'Primary Builder',value:60 },{ label:'Major Contributor',value:30 },{ label:'Minor Contributor',value:10 }],
};

const HEALTH_SCORE = 72;
const BREAKDOWN = [
  { label:'Project Quality', value:80, color:D.purple },
  { label:'Contribution',    value:70, color:D.green  },
  { label:'Consistency',     value:60, color:D.amber  },
  { label:'Role Alignment',  value:75, color:D.blue   },
];
const KEY_INSIGHTS = [
  { dot:D.purple, text:'Profile is backend-heavy with strong API and Node.js experience' },
  { dot:D.green,  text:'Primary builder on 60% of projects — strong ownership signal'   },
  { dot:D.amber,  text:'Most projects are mid-level (L2) — limited high-complexity work' },
  { dot:D.blue,   text:'Activity trending upward from 2024 → 2025'                      },
];
const GAPS = [
  'No recent project added in the last 2 weeks — activity gap detected',
  'No high-complexity (L3) project found — limits senior positioning',
  'Low contribution level detected in 2 of 3 projects',
  'Frontend coverage is low — profile skews heavily backend',
];
const SUGGESTIONS = [
  'Add 1 high-complexity (L3) project to push score above 85',
  'Upload a recent project to restore activity and stay relevant',
  'Add frontend-focused projects to balance your full-stack claim',
  'Take primary builder role on more projects to boost contribution score',
];
const ACTIVITY = [
  { label:'Last active',         val:'10 days ago' },
  { label:'Projects this month', val:'2 added'     },
  { label:'Projects this year',  val:'3 total'     },
  { label:'Avg project age',     val:'2.5 years'   },
  { label:'Oldest project',      val:'4 years old' },
];
const CONTRIB_COLORS = [D.purple, D.green, D.amber];

const STATUS_CHECKS = [
  { label:'Profile data loaded',         key:'profile'  },
  { label:'Projects imported (3 found)', key:'projects' },
  { label:'AI evaluations available',    key:'ai'       },
  { label:'Analyzer engine ready',       key:'engine'   },
];
const LOG_SEQUENCE = [
  '→ Bootstrapping analyzer engine…',
  '→ Loading project metadata (3 repos)…',
  '→ Running complexity classifier…',
  '→ Evaluating contribution signals…',
  '→ Scoring role alignment (Full Stack)…',
  '→ Aggregating strength areas…',
  '→ Computing profile health score…',
  '✓ Analysis complete — 72/100',
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  @keyframes pa-spin        { to { transform: rotate(360deg); } }
  @keyframes pa-blink       { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pa-slideUp     { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }
  @keyframes pa-slideDown   { from { transform: translateY(0);    opacity:1; } to { transform: translateY(100%); opacity:0; } }
  @keyframes pa-fadeIn      { from { opacity:0; } to { opacity:1; } }
  @keyframes pa-fadeOut     { from { opacity:1; } to { opacity:0; } }
  @keyframes pa-expandBody  { from { max-height:0; opacity:0; } to { max-height:600px; opacity:1; } }
  @keyframes pa-collapseBody{ from { max-height:600px; opacity:1; } to { max-height:0; opacity:0; } }
  @keyframes pa-popIn       { from { transform:scale(0.92) translateY(12px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }

  /* Desktop panel override */
  @media (min-width: 768px) {
    .pa-float-panel {
      left: auto !important;
      right: 24px !important;
      bottom: 24px !important;
      width: 380px !important;
      border-radius: 20px !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-bottom: 1px solid rgba(255,255,255,0.1) !important;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) !important;
      animation: pa-popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both !important;
    }
    .pa-float-panel.closing {
      animation: pa-fadeOut 0.25s ease forwards !important;
    }
  }

  .pa-float-panel {
    animation: pa-slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both;
  }
  .pa-float-panel.closing {
    animation: pa-slideDown 0.3s ease forwards;
  }

  .pa-body-open {
    animation: pa-expandBody 0.35s cubic-bezier(0.4,0,0.2,1) both;
    overflow: hidden;
  }
  .pa-body-close {
    animation: pa-collapseBody 0.28s cubic-bezier(0.4,0,0.2,1) forwards;
    overflow: hidden;
  }

  .pa-backdrop-in  { animation: pa-fadeIn  0.3s ease both; }
  .pa-backdrop-out { animation: pa-fadeOut 0.3s ease forwards; }

  .pa-close-btn:disabled {
    opacity: 0.25 !important;
    cursor: not-allowed !important;
  }
  .pa-close-btn:not(:disabled):hover {
    background: rgba(255,255,255,0.08) !important;
  }

  .pa-check-row {
    transition: background 0.35s ease, border-color 0.35s ease;
  }
  .pa-log-line {
    animation: pa-fadeIn 0.2s ease both;
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div style={{ position:'relative', width:130, height:130, flexShrink:0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke={D.surfaceEl} strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={D.purple} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 65 65)" style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'Syne, sans-serif', fontSize:32, fontWeight:800, lineHeight:1, color:D.text }}>{score}</span>
        <span style={{ fontSize:12, color:D.muted, fontWeight:500 }}>/100</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, color }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <span style={{ fontSize:11, fontWeight:500, color:D.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, height:6, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
          <div style={{ width:`${value}%`, height:'100%', borderRadius:99, background:color, transition:'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <span style={{ fontSize:12, fontWeight:600, minWidth:28, textAlign:'right', color:D.text }}>{value}</span>
      </div>
    </div>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ borderRadius:20, border:`1px solid ${D.border}`, background:D.surface, padding:'1.25rem', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, iconBg, title }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
      <div style={{ width:32, height:32, borderRadius:10, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
      <span style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:700, color:D.text }}>{title}</span>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ borderRadius:16, padding:14, background:D.surfaceEl, border:`1px solid ${D.border}` }}>
      <div style={{ fontSize:11, fontWeight:500, color:D.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:700, lineHeight:1.1, color:D.text }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function InsightItem({ dot, text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:14, background:D.surfaceEl, border:`1px solid ${D.border}`, fontSize:13, lineHeight:1.5, color:D.mutedMid }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:dot, flexShrink:0, marginTop:4 }} />
      <span>{text}</span>
    </div>
  );
}

function GapItem({ text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:14, background:D.coralDim, border:`1px solid rgba(255,107,74,0.2)`, fontSize:13, lineHeight:1.5, color:'#ffb3a0', marginBottom:8 }}>
      <AlertTriangle size={14} style={{ flexShrink:0, marginTop:1, color:D.coral }} />
      <span>{text}</span>
    </div>
  );
}

function SuggestionItem({ num, text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:14, background:D.greenDim, border:`1px solid rgba(52,199,128,0.2)`, fontSize:13, lineHeight:1.5, color:'#7de0b0', marginBottom:8 }}>
      <div style={{ width:20, height:20, borderRadius:'50%', background:D.green, color:'#0a1f14', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{num}</div>
      <span>{text}</span>
    </div>
  );
}

function ProgressBar({ label, value, max, color, unit='' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
        <span style={{ color:D.muted }}>{label}</span>
        <span style={{ fontWeight:600, color:D.text }}>{value}{unit}</span>
      </div>
      <div style={{ height:8, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
        <div style={{ width:`${Math.min(100,(value/max)*100)}%`, height:'100%', borderRadius:99, background:color }} />
      </div>
    </div>
  );
}

function ActivityRow({ label, val }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${D.border}`, fontSize:13 }}>
      <span style={{ color:D.muted }}>{label}</span>
      <span style={{ fontWeight:600, color:D.text }}>{val}</span>
    </div>
  );
}

// ─── Floating Panel ───────────────────────────────────────────────────────────

function FloatingPanel({ phase, checks, logs, onDismiss }) {
  const logEndRef              = useRef(null);
  const [collapsed, setCollapsed]   = useState(false);
  const [bodyAnim, setBodyAnim]     = useState('');   // 'open' | 'close'
  const [panelAnim, setPanelAnim]   = useState('');   // 'closing'
  const [backdropAnim, setBackdropAnim] = useState('pa-backdrop-in');
  const [visible, setVisible]       = useState(false);

  const isChecking  = phase === 'checking';
  const isAnalyzing = phase === 'analyzing';
  const isDone      = phase === 'done';
  const canClose    = isDone;           // close btn enabled only when fully done

  // Mount panel with slide-in
  useEffect(() => {
    if (phase !== null && !visible) setVisible(true);
  }, [phase]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [logs]);

  // Collapse/expand animation
  const toggleCollapse = () => {
    if (collapsed) {
      setBodyAnim('open');
      setCollapsed(false);
    } else {
      setBodyAnim('close');
      // wait for anim then truly collapse
      setTimeout(() => setCollapsed(true), 270);
    }
  };

  // Dismiss with slide-out
  const handleDismiss = () => {
    if (!canClose) return;
    setPanelAnim('closing');
    setBackdropAnim('pa-backdrop-out');
    setTimeout(() => { setVisible(false); onDismiss(); }, 300);
  };

  if (!visible || phase === null) return null;

  // Panel header colours
  const headerBg    = isChecking ? D.purpleDim : isAnalyzing ? D.greenDim : D.greenDim;
  const headerColor = isChecking ? D.purple    : isAnalyzing ? D.green    : D.green;
  const headerLabel = isChecking ? 'Checking analyzer status…'
                    : isAnalyzing ? 'Running analysis…'
                    : 'Analysis complete';

  return (
    <>
      {/* Backdrop */}
      {!isDone && (
        <div
          className={backdropAnim}
          style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }}
        />
      )}

      {/* Panel */}
      <div
        className={`pa-float-panel${panelAnim === 'closing' ? ' closing' : ''}`}
        style={{
          position:'fixed', zIndex:60,
          bottom:0, left:0, right:0,
          background:'#16161a',
          borderRadius: collapsed ? '20px 20px 0 0' : '24px 24px 0 0',
          boxShadow:'0 -12px 60px rgba(0,0,0,0.8)',
          border:`1px solid rgba(255,255,255,0.09)`,
          borderBottom:'none',
          fontFamily:'DM Sans, sans-serif',
          overflow:'hidden',
        }}
      >
        {/* Drag pill */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:4, cursor:'pointer' }} onClick={toggleCollapse}>
          <div style={{ width:36, height:4, borderRadius:99, background:'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px 13px', borderBottom: collapsed ? 'none' : `1px solid rgba(255,255,255,0.07)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:headerBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {isChecking  && <Loader2      size={14} color={headerColor} style={{ animation:'pa-spin 1s linear infinite' }} />}
              {isAnalyzing && <Terminal     size={14} color={headerColor} />}
              {isDone      && <CheckCircle2 size={14} color={headerColor} />}
            </div>
            <span style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:700, color:D.text }}>{headerLabel}</span>
            {!isDone && (
              <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:headerBg, color:headerColor, fontWeight:600, letterSpacing:'0.3px' }}>
                {isChecking ? 'Status check' : 'Analyzing'}
              </span>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {/* Collapse toggle */}
            <button
              onClick={toggleCollapse}
              style={{ background:'none', border:'none', cursor:'pointer', color:D.muted, display:'flex', alignItems:'center', padding:6, borderRadius:8, transition:'background 0.15s' }}
            >
              {collapsed ? <ChevronUp size={18} color={D.muted} /> : <ChevronDown size={18} color={D.muted} />}
            </button>

            {/* Close — disabled until done */}
            <button
              onClick={handleDismiss}
              disabled={!canClose}
              className="pa-close-btn"
              title={canClose ? 'Dismiss' : 'Wait for analysis to finish…'}
              style={{ background:'none', border:'none', cursor: canClose ? 'pointer' : 'not-allowed', color:D.muted, display:'flex', alignItems:'center', padding:6, borderRadius:8, transition:'background 0.15s, opacity 0.2s', opacity: canClose ? 1 : 0.2 }}
            >
              <X size={17} color={canClose ? D.mutedMid : D.muted} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!collapsed && (
          <div
            className={bodyAnim === 'open' ? 'pa-body-open' : bodyAnim === 'close' ? 'pa-body-close' : 'pa-body-open'}
            style={{ padding:'16px 20px 24px' }}
          >
            {/* STATUS CHECKS */}
            {isChecking && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ fontSize:12, color:D.muted, marginBottom:4 }}>Verifying prerequisites before analysis starts…</p>
                {STATUS_CHECKS.map((item, i) => {
                  const done   = i < checks;
                  const active = i === checks;
                  return (
                    <div
                      key={item.key}
                      className="pa-check-row"
                      style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'9px 14px', borderRadius:14,
                        background: done ? D.greenDim : active ? D.purpleDim : 'rgba(255,255,255,0.03)',
                        border:`1px solid ${done ? 'rgba(52,199,128,0.2)' : active ? 'rgba(139,130,240,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {done
                        ? <CheckCircle2 size={15} color={D.green}  style={{ flexShrink:0 }} />
                        : active
                          ? <Loader2 size={15} color={D.purple} style={{ flexShrink:0, animation:'pa-spin 1s linear infinite' }} />
                          : <div style={{ width:15, height:15, borderRadius:'50%', border:`1.5px solid rgba(255,255,255,0.15)`, flexShrink:0 }} />
                      }
                      <span style={{ fontSize:13, color: done ? '#7de0b0' : active ? '#c4bfff' : D.muted, fontWeight: done || active ? 500 : 400 }}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ANALYSIS LOGS */}
            {(isAnalyzing || isDone) && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <Terminal size={12} color={D.muted} />
                  <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.7px', textTransform:'uppercase', color:D.muted }}>Live log</span>
                </div>

                <div style={{ background:'#0a0a0d', borderRadius:14, padding:'12px 14px', maxHeight:190, overflowY:'auto', fontFamily:'monospace', fontSize:12, lineHeight:1.8, border:`1px solid rgba(255,255,255,0.05)` }}>
                  {logs.map((line, i) => (
                    <div
                      key={i}
                      className="pa-log-line"
                      style={{ color: line.startsWith('✓') ? D.green : line.startsWith('→') ? '#8b82f0' : '#c0c0cc' }}
                    >
                      <span style={{ color:'#2e2e38', marginRight:10, userSelect:'none' }}>{String(i+1).padStart(2,'0')}</span>
                      {line}
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div style={{ color:D.purple, marginTop:2 }}>
                      <span style={{ color:'#2e2e38', marginRight:10 }}>--</span>
                      <span style={{ animation:'pa-blink 1s step-end infinite' }}>▋</span>
                    </div>
                  )}
                  <div ref={logEndRef} />
                </div>

                {isDone && (
                  <div style={{ marginTop:12, padding:'10px 14px', borderRadius:14, background:D.greenDim, border:`1px solid rgba(52,199,128,0.2)`, display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle2 size={15} color={D.green} />
                    <span style={{ fontSize:13, color:'#7de0b0', fontWeight:500 }}>
                      Profile score: <strong style={{ color:D.green }}>72/100</strong> — results ready below
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{GLOBAL_CSS}</style>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileAnalyzer() {
  const [phase,  setPhase]  = useState(null);
  const [checks, setChecks] = useState(0);
  const [logs,   setLogs]   = useState([]);

  const charts        = MOCK_CHARTS;
  const contrib       = charts.contribution_pie;
  const complexity    = charts.complexity_breakdown;
  const techUsage     = charts.technology_usage;
  const activity      = charts.activity_pattern;
  const roleAlignment = charts.role_alignment;
  const strengthAreas = charts.strength_areas;

  const run = () => {
    setLogs([]);
    setChecks(0);
    setPhase('checking');

    STATUS_CHECKS.forEach((_, i) => {
      setTimeout(() => setChecks(i + 1), 600 + i * 700);
    });

    const checksDone = 600 + STATUS_CHECKS.length * 700 + 300;
    setTimeout(() => setPhase('analyzing'), checksDone);

    LOG_SEQUENCE.forEach((line, i) => {
      setTimeout(() => setLogs(l => [...l, line]), checksDone + 200 + i * 400);
    });

    const total = checksDone + 200 + LOG_SEQUENCE.length * 400 + 500;
    setTimeout(() => setPhase('done'), total);
  };

  useEffect(() => { run(); }, []);

  const isActive = phase === 'checking' || phase === 'analyzing';

  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', background:D.bg, minHeight:'100vh', padding:'1.5rem 1rem 4rem', maxWidth:960, margin:'0 auto', position:'relative' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Blurred content wrapper ── */}
      <div style={{ filter: isActive ? 'blur(3px)' : 'none', transition:'filter 0.45s ease', pointerEvents: isActive ? 'none' : 'auto', userSelect: isActive ? 'none' : 'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:800, letterSpacing:'-0.5px', color:D.text }}>
              Profile Analyzer
            </span>
            <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:99, background:D.blueDim, color:D.blue, letterSpacing:'0.3px' }}>
              AI Coach
            </span>
          </div>
          <button
            onClick={run}
            disabled={isActive}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500, padding:'7px 14px', borderRadius:99, border:`1px solid ${D.borderMid}`, background:D.surfaceEl, color:D.mutedMid, cursor: isActive ? 'default' : 'pointer', opacity: isActive ? 0.5 : 1, transition:'opacity 0.2s' }}
          >
            {isActive
              ? <Loader2 size={14} style={{ animation:'pa-spin 1s linear infinite' }} />
              : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>

        {/* Health Score Hero */}
        <div style={{ borderRadius:24, border:`1px solid ${D.border}`, background:D.surface, padding:'2rem', marginBottom:'1.25rem', display:'grid', gridTemplateColumns:'auto 1fr', gap:'2rem', alignItems:'center' }}>
          <ScoreRing score={HEALTH_SCORE} />
          <div>
            <div style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:700, marginBottom:'1rem', color:D.text }}>Profile Strength</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {BREAKDOWN.map(b => <BreakdownBar key={b.label} {...b} />)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:'1.25rem' }}>
          <StatCard label="Experience"     value="Senior" sub="Complexity signals" />
          <StatCard label="Avg Confidence" value="87%"    sub="Across projects"    />
          <StatCard label="Verified"       value="2"      sub="of 3 imported"      />
          <StatCard label="Complexity"     value="0.0/10" sub="Architecture score" />
        </div>

        {/* Insights + Gaps */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem', alignItems:'start' }}>
          <Card>
            <CardHeader icon={<Info size={15} color={D.purple} />} iconBg={D.purpleDim} title="Key Insights" />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {KEY_INSIGHTS.map((ins, i) => <InsightItem key={i} {...ins} />)}
            </div>
          </Card>
          <Card>
            <CardHeader icon={<AlertTriangle size={15} color={D.coral} />} iconBg={D.coralDim} title="Issues & Gaps" />
            {GAPS.map((g, i) => <GapItem key={i} text={g} />)}
          </Card>
        </div>

        {/* Suggestions + Activity */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem', alignItems:'start' }}>
          <Card>
            <CardHeader icon={<Lightbulb size={15} color={D.green} />} iconBg={D.greenDim} title="Actionable Suggestions" />
            {SUGGESTIONS.map((s, i) => <SuggestionItem key={i} num={i+1} text={s} />)}
          </Card>
          <Card>
            <CardHeader icon={<TrendingUp size={15} color={D.green} />} iconBg={D.greenDim} title="Growth & Activity" />
            {ACTIVITY.map((a, i) => <ActivityRow key={i} label={a.label} val={a.val} />)}
            <div style={{ marginTop:'1rem' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', color:D.muted, marginBottom:'0.75rem' }}>Activity by Year</div>
              {activity.map(a => (
                <ProgressBar key={a.label} label={a.label} value={a.value} max={5} color={D.green} unit=" projects" />
              ))}
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.25rem', alignItems:'start' }}>
          <Card>
            <CardHeader icon={<Zap size={15} color={D.amber} />} iconBg={D.amberDim} title="Project Complexity" />
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={complexity} barSize={28}>
                <XAxis dataKey="label" tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[8,8,0,0]}>
                  {complexity.map((_,i)=><Cell key={i} fill={['#5a53c4','#7F77DD','#a49ef0'][i]||D.purple}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <CardHeader icon={<Info size={15} color={D.blue} />} iconBg={D.blueDim} title="Tech Usage" />
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={techUsage} layout="vertical" barSize={18}>
                <XAxis type="number" tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} domain={[0,100]} />
                <YAxis dataKey="label" type="category" tick={{ fontSize:11, fill:D.muted }} axisLine={false} tickLine={false} width={52} />
                <Bar dataKey="value" radius={[0,8,8,0]}>
                  {techUsage.map((_,i)=><Cell key={i} fill={[D.blue,'#2a6eb5'][i]||D.blue}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <CardHeader icon={<Info size={15} color={D.purple} />} iconBg={D.purpleDim} title="Contribution Split" />
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={contrib} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                  {contrib.map((_,i)=><Cell key={i} fill={CONTRIB_COLORS[i]||'#ccc'}/>)}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ background:D.surfaceEl, border:`1px solid ${D.border}`, borderRadius:10, color:D.text, fontSize:12 }}
                  formatter={(val,name)=>[`${val}%`,name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
              {contrib.map((c,i)=>(
                <span key={i} style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:D.muted }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:CONTRIB_COLORS[i], display:'inline-block' }}/>
                  {c.label.replace(' Builder','').replace(' Contributor','')} {c.value}%
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Strength + Role */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', alignItems:'start' }}>
          <Card>
            <CardHeader icon={<Zap size={15} color={D.green} />} iconBg={D.greenDim} title="Strength Areas" />
            {strengthAreas.map(s=>(
              <ProgressBar key={s.label} label={s.label} value={s.value} max={10} color={D.purple} unit="/10" />
            ))}
          </Card>
          <Card>
            <CardHeader icon={<Info size={15} color={D.pink} />} iconBg="rgba(232,96,138,0.15)" title="Role Alignment" />
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:D.muted, marginBottom:4 }}>Claimed role</div>
              <div style={{ fontSize:14, fontWeight:600, color:D.text }}>{roleAlignment.claimed_role}</div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:D.muted, marginBottom:6 }}>Alignment score</div>
              <div style={{ height:10, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                <div style={{ width:`${(roleAlignment.alignment_score/10)*100}%`, height:'100%', borderRadius:99, background:D.pink }} />
              </div>
              <div style={{ fontSize:12, fontWeight:600, marginTop:4, color:D.text }}>{roleAlignment.alignment_score}/10</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {roleAlignment.detected_roles.map(r=>(
                <div key={r.label} style={{ flex:1, borderRadius:12, background:D.surfaceEl, border:`1px solid ${D.border}`, padding:10, textAlign:'center' }}>
                  <div style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:700, color:D.text }}>{r.value}</div>
                  <div style={{ fontSize:11, color:D.muted }}>{r.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>{/* end blur wrapper */}

      {/* Floating Panel */}
      <FloatingPanel
        phase={phase}
        checks={checks}
        logs={logs}
        onDismiss={() => setPhase(null)}
      />
    </div>
  );
}