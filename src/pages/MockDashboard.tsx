// import styles from './MockDashboard.module.css';
// /**
//  * Dashboard.jsx — Dark-theme developer dashboard (mock data, fully standalone)
//  * No external API or routing deps required — pure React + recharts + lucide-react
//  */

// import { useState } from 'react';
// import {
//   Github, Loader2, RefreshCw, Plus, GitBranch,
//   Check, Cpu, Info, FileUp, TestTube, BarChart3,
//   ChevronRight, Star, Zap, Shield, Eye, EyeOff,
//   Settings, RotateCcw, ExternalLink, Activity,
//   AlertCircle, X,
// } from 'lucide-react';
// import {
//   BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
//   PieChart, Pie, Cell, Tooltip as RTooltip,
// } from 'recharts';

// // ─── Design tokens ────────────────────────────────────────────────────────────
// const T = {
//   bg:        '#08090c',
//   surface:   '#0f1014',
//   surfaceEl: '#15161c',
//   surfaceHov:'#1c1d26',
//   border:    'rgba(255,255,255,0.06)',
//   borderMid: 'rgba(255,255,255,0.11)',
//   borderHi:  'rgba(255,255,255,0.20)',
//   text:      '#eeeef2',
//   muted:     '#5c5c6e',
//   mutedMid:  '#8888a0',
//   purple:    '#8b7cf8',
//   purpleLt:  '#a99fff',
//   purpleDim: '#1e1a35',
//   green:     '#22d38a',
//   greenDim:  '#0c2018',
//   amber:     '#f5a623',
//   amberDim:  '#251a08',
//   blue:      '#3b9eff',
//   blueDim:   '#0c1e30',
//   coral:     '#ff5f4a',
//   coralDim:  '#25100c',
//   pink:      '#e05c8a',
//   teal:      '#2dd4bf',
//   tealDim:   '#0a2020',
// };

// const GLOBAL_CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
//   @keyframes db-pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
//   @keyframes db-spin   { to{transform:rotate(360deg)} }
//   @keyframes db-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
//   @keyframes db-popIn  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
//   * { box-sizing: border-box; margin: 0; padding: 0; }
//   body { background: ${T.bg}; }
// `;

// // ─── Mock data ────────────────────────────────────────────────────────────────
// const MOCK_DEV = {
//   name:            'Alex Rivera',
//   github_username: 'alexrivera',
//   github_avatar:   'https://avatars.githubusercontent.com/u/1024025?v=4',
//   primary_role:    'Full Stack Developer',
//   bio:             'Building scalable web applications with modern tooling. Passionate about clean architecture, developer experience, and open-source. 5+ years shipping production code.',
//   primary_stack:   ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
//   experience_signal: 'Senior',
//   verified_projects: 3,
//   average_confidence: 84,
//   is_published:    true,
//   contribution_breakdown: { 'Primary Builder': 3, 'Major Contributor': 2, 'Minor Contributor': 1 },
// };

// const MOCK_STATS = {
//   repository_quality:      78,
//   collaborative_development: 65,
//   total_projects:          6,
//   overall_skill_level:     'Advanced',
//   total_commits:           1247,
//   primary_technologies:    ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
// };

// const MOCK_PROJECTS = [
//   {
//     id: '1',
//     name: 'commerce-platform',
//     description: 'Full-stack e-commerce platform with Next.js, Stripe payments, real-time inventory management, and a custom admin dashboard. Deployed on Vercel with edge functions.',
//     language: 'TypeScript',
//     commits_count: 342,
//     github_url: 'https://github.com/alexrivera/commerce-platform',
//     evaluation_status: 'completed',
//     ai_evaluation: {
//       difficulty_tier: 'Advanced',
//       repo_score: 91,
//       confidence_score: 88,
//       detected_project_type: 'E-commerce',
//       has_tests: true,
//       contribution_percentage: 82,
//       verified_badge: true,
//       role_mismatch: false,
//     },
//   },
//   {
//     id: '2',
//     name: 'realtime-collab',
//     description: 'Collaborative document editor with operational transforms, WebSocket-based sync, conflict resolution, and offline-first architecture using IndexedDB.',
//     language: 'TypeScript',
//     commits_count: 198,
//     github_url: 'https://github.com/alexrivera/realtime-collab',
//     evaluation_status: 'completed',
//     ai_evaluation: {
//       difficulty_tier: 'Advanced',
//       repo_score: 87,
//       confidence_score: 82,
//       detected_project_type: 'SaaS Tool',
//       has_tests: true,
//       contribution_percentage: 95,
//       verified_badge: true,
//     },
//   },
//   {
//     id: '3',
//     name: 'ml-pipeline-api',
//     description: 'REST API wrapping a Python ML inference pipeline. Includes async job queue with Bull, Redis caching, rate limiting, and OpenAPI documentation.',
//     language: 'JavaScript',
//     commits_count: 87,
//     github_url: 'https://github.com/alexrivera/ml-pipeline-api',
//     evaluation_status: 'completed',
//     ai_evaluation: {
//       difficulty_tier: 'Intermediate',
//       repo_score: 74,
//       confidence_score: 79,
//       detected_project_type: 'API / Backend',
//       has_tests: true,
//       contribution_percentage: 100,
//       verified_badge: true,
//     },
//   },
//   {
//     id: '4',
//     name: 'design-system',
//     description: 'Component library and design system built with Radix UI primitives, Storybook documentation, automated visual regression testing, and NPM publishing pipeline.',
//     language: 'TypeScript',
//     commits_count: 264,
//     github_url: 'https://github.com/alexrivera/design-system',
//     evaluation_status: 'completed',
//     ai_evaluation: {
//       difficulty_tier: 'Intermediate',
//       repo_score: 80,
//       confidence_score: 85,
//       detected_project_type: 'UI Library',
//       has_tests: true,
//       contribution_percentage: 68,
//       verified_badge: false,
//     },
//   },
//   {
//     id: '5',
//     name: 'devops-toolkit',
//     description: 'CLI tool for scaffolding Docker Compose environments, GitHub Actions workflows, and Terraform modules. Built with Node.js and Commander.',
//     language: 'JavaScript',
//     commits_count: 56,
//     github_url: 'https://github.com/alexrivera/devops-toolkit',
//     evaluation_status: 'completed',
//     ai_evaluation: {
//       difficulty_tier: 'Intermediate',
//       repo_score: 68,
//       confidence_score: 72,
//       detected_project_type: 'CLI Tool',
//       has_tests: false,
//       contribution_percentage: 100,
//       verified_badge: false,
//     },
//   },
//   {
//     id: '6',
//     name: 'personal-blog',
//     description: 'Statically generated blog with MDX, syntax highlighting, RSS feed, dark mode, and an automated deployment pipeline via GitHub Actions.',
//     language: 'TypeScript',
//     commits_count: 42,
//     github_url: 'https://github.com/alexrivera/personal-blog',
//     evaluation_status: 'completed',
//     ai_evaluation: {
//       difficulty_tier: 'Beginner',
//       repo_score: 55,
//       confidence_score: 90,
//       detected_project_type: 'Static Site',
//       has_tests: false,
//       contribution_percentage: 100,
//       verified_badge: false,
//     },
//   },
// ];

// const ACTIVITY_DATA = [
//   { month: 'Aug', commits: 94 },
//   { month: 'Sep', commits: 128 },
//   { month: 'Oct', commits: 76 },
//   { month: 'Nov', commits: 210 },
//   { month: 'Dec', commits: 183 },
//   { month: 'Jan', commits: 245 },
// ];

// const LANG_DATA = [
//   { name: 'TypeScript', value: 61, color: T.blue },
//   { name: 'JavaScript', value: 27, color: T.amber },
//   { name: 'Other',      value: 12, color: T.muted },
// ];

// // ─── Badge palette ────────────────────────────────────────────────────────────
// const BADGE_PALETTE = [
//   { bg:'rgba(139,124,248,0.13)', border:'rgba(139,124,248,0.28)', color:'#b4a8ff' },
//   { bg:'rgba(59,158,255,0.13)',  border:'rgba(59,158,255,0.28)',  color:'#7abfff' },
//   { bg:'rgba(34,211,138,0.13)',  border:'rgba(34,211,138,0.28)',  color:'#5dd6a8' },
//   { bg:'rgba(245,166,35,0.13)',  border:'rgba(245,166,35,0.28)',  color:'#f5c26b' },
//   { bg:'rgba(45,212,191,0.13)',  border:'rgba(45,212,191,0.28)',  color:'#5dddd0' },
//   { bg:'rgba(224,92,138,0.13)',  border:'rgba(224,92,138,0.28)',  color:'#f093bb' },
//   { bg:'rgba(255,95,74,0.13)',   border:'rgba(255,95,74,0.28)',   color:'#ff9080' },
// ];

// const techBadgeStyle = tech => BADGE_PALETTE[tech.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % BADGE_PALETTE.length];

// const complexityColor = tier => {
//   const t = (tier||'').toLowerCase();
//   if (t.includes('beginner'))     return { bg:'rgba(34,211,138,0.12)',  color: T.green  };
//   if (t.includes('intermediate')) return { bg:'rgba(59,158,255,0.12)',  color: T.blue   };
//   if (t.includes('advanced'))     return { bg:'rgba(245,166,35,0.12)',  color: T.amber  };
//   if (t.includes('expert'))       return { bg:'rgba(139,124,248,0.12)', color: T.purple };
//   return { bg:'rgba(255,255,255,0.06)', color: T.mutedMid };
// };

// const LANG_EMOJI = { typescript:'🟦', javascript:'🟨', python:'🐍', java:'☕', go:'💧', rust:'🦀', 'c++':'➕', 'c#':'🎯', php:'🐘', ruby:'💎', swift:'🦅', kotlin:'🟪', html:'🌐', css:'🎨' };

// // ─── Atoms ────────────────────────────────────────────────────────────────────

// type PillProps = {
//   children: React.ReactNode;
//   style?: React.CSSProperties;
//   background?: string;
//   color?: string;
//   border?: string;
//   fontSize?: number | string;
// };
// function Pill({ children, style = {}, background, color, border, fontSize }: PillProps) {
//   const pillStyle: React.CSSProperties = {
//     ...(background ? { '--pill-bg': background } as React.CSSProperties : {}),
//     ...(color ? { '--pill-color': color } as React.CSSProperties : {}),
//     ...(border ? { '--pill-border': border } as React.CSSProperties : {}),
//     ...(fontSize ? { '--pill-fontSize': typeof fontSize === 'number' ? fontSize + 'px' : fontSize } as React.CSSProperties : {}),
//     ...style,
//   };
//   return <span className={styles.pill} style={pillStyle}>{children}</span>;
// }

// function TechBadge({ tech }) {
//   const s = techBadgeStyle(tech);
//   return <Pill background={s.bg} border={`1px solid ${s.border}`} color={s.color}>{tech}</Pill>;
// }

// type StatBlockProps = {
//   label: string;
//   value: React.ReactNode;
//   accent?: string;
//   wide?: boolean;
// };
// function StatBlock({ label, value, accent, wide }: StatBlockProps) {
//   const statStyle: React.CSSProperties = accent ? { '--stat-accent': accent } as React.CSSProperties : {};
//   return (
//     <div className={styles.statBlock + (wide ? ' ' + styles.statBlockWide : '')} style={statStyle}>
//       <div className={styles.statLabel}>{label}</div>
//       <div className={styles.statValue}>{value}</div>
//     </div>
//   );
// }

// type BarRowProps = {
//   label: string;
//   value: number;
//   color?: string;
// };
// function BarRow({ label, value, color = T.purple }: BarRowProps) {
//   const fillStyle: React.CSSProperties = {
//     '--bar-width': `${Math.min(100, value ?? 0)}%`,
//     '--bar-color': color,
//   } as React.CSSProperties;
//   return (
//     <div className={styles.barRow}>
//       <div className={styles.barRowHeader}>
//         <span className={styles.barRowLabel}>{label}</span>
//         <span className={styles.barRowValue}>{Math.round(value ?? 0)}%</span>
//       </div>
//       <div className={styles.barRowBg}>
//         <div className={styles.barRowFill} style={fillStyle} />
//       </div>
//     </div>
//   );
// }

// type GlassCardProps = {
//   children: React.ReactNode;
//   hover?: boolean;
//   onClick?: () => void;
//   className?: string;
// };
// function GlassCard({ children, hover = true, onClick, className }: GlassCardProps) {
//   const [hov, setHov] = useState(false);
//   const classNames = [
//     styles.glassCard,
//     hov && hover ? styles.glassCardHover : '',
//     className || ''
//   ].join(' ');
//   return (
//     <div
//       className={classNames}
//       onClick={onClick}
//       onMouseEnter={() => hover && setHov(true)}
//       onMouseLeave={() => hover && setHov(false)}
//       style={{ cursor: onClick ? 'pointer' : 'default' }}
//     >
//       {children}
//     </div>
//   );
// }

// function Btn({ icon: Icon, label, onClick, disabled, variant='outline', small }) {
//   const [hov, setHov] = useState(false);
//   const isPrimary = variant === 'primary';
//   const isDanger  = variant === 'danger';
//   const classNames = [
//     styles.btn,
//     small ? styles.btnSmall : '',
//     isPrimary ? styles.btnPrimary : '',
//     isPrimary && hov ? styles.btnPrimaryHover : '',
//     isDanger ? styles.btnDanger : '',
//     isDanger && hov ? styles.btnDangerHover : '',
//     disabled ? styles.btnDisabled : '',
//   ].join(' ');
//   return (
//     <button
//       className={classNames}
//       onClick={onClick}
//       disabled={disabled}
//       onMouseEnter={()=>setHov(true)}
//       onMouseLeave={()=>setHov(false)}
//     >
//       {Icon && <Icon size={14} style={disabled && label?.includes('nalyz') ? {animation:'db-spin 1s linear infinite'} : {}} />}
//       {label}
//     </button>
//   );
// }

// // ─── Modal ────────────────────────────────────────────────────────────────────
// function Modal({ open, onClose, children }) {
//   if (!open) return null;
//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalBackdrop} onClick={onClose} />
//       <div className={styles.modalContent}>
//         <button className={styles.modalCloseBtn} onClick={onClose}>
//           <X size={16}/>
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

// // ─── Project card ─────────────────────────────────────────────────────────────
// function ProjectCard({ project, onView, anim }) {
//   const cc = complexityColor(project.ai_evaluation?.difficulty_tier);
//   const lang = (project.language||'').toLowerCase();
//   const emoji = LANG_EMOJI[lang] || '📁';
//   return (
//     <GlassCard onClick={() => onView(project)} className={styles.glassCard + ' ' + styles.glassCardAnim1}>
//       <div className={styles.projectAccentLine} />
//       <div className={styles.projectHeader}>
//         <div className={styles.projectHeaderLeft}>
//           <div className={styles.projectHeaderTitleRow}>
//             <span className={styles.projectTitle}>{project.name}</span>
//             <Pill background={cc.bg} color={cc.color} border={`1px solid ${cc.color}30`} fontSize={10}>
//               {project.ai_evaluation?.difficulty_tier}
//             </Pill>
//             {project.ai_evaluation?.verified_badge && (
//               <Pill background="rgba(34,211,138,0.12)" color={T.green} border={`1px solid rgba(34,211,138,0.25)`} fontSize={10}>
//                 <Shield size={9} /> Verified
//               </Pill>
//             )}
//           </div>
//           <div className={styles.projectMetaPills}>
//             <Pill background={T.surfaceEl} border={`1px solid ${T.border}`} color={T.mutedMid} fontSize={10}>
//               {emoji} {project.language}
//             </Pill>
//             {project.ai_evaluation?.repo_score !== undefined && (
//               <Pill background={T.purpleDim} color={T.purple} border={`1px solid rgba(139,124,248,0.22)`} fontSize={10}>
//                 <Star size={9} /> {Math.round(project.ai_evaluation.repo_score)}%
//               </Pill>
//             )}
//             {project.ai_evaluation?.confidence_score !== undefined && (
//               <Pill background={T.surfaceEl} border={`1px solid ${T.border}`} color={T.muted} fontSize={10}>
//                 {Math.round(project.ai_evaluation.confidence_score)}% conf
//               </Pill>
//             )}
//             {project.ai_evaluation?.detected_project_type && (
//               <Pill background={T.blueDim} color={T.blue} border={`1px solid rgba(59,158,255,0.2)`} fontSize={10}>
//                 {project.ai_evaluation.detected_project_type}
//               </Pill>
//             )}
//             {project.ai_evaluation?.has_tests !== undefined && (
//               <Pill background={project.ai_evaluation.has_tests ? T.greenDim : T.amberDim} color={project.ai_evaluation.has_tests ? T.green : T.amber} border={`1px solid ${project.ai_evaluation.has_tests ? 'rgba(34,211,138,0.2)' : 'rgba(245,166,35,0.2)'}`} fontSize={10}>
//                 <TestTube size={9} /> {project.ai_evaluation.has_tests ? 'Tests ✓' : 'No tests'}
//               </Pill>
//             )}
//             {project.ai_evaluation?.contribution_percentage !== undefined && (
//               <Pill background={T.surfaceEl} border={`1px solid ${T.border}`} color={T.muted} fontSize={10}>
//                 {Math.round(project.ai_evaluation.contribution_percentage)}% contrib
//               </Pill>
//             )}
//             <Pill background={T.surfaceEl} border={`1px solid ${T.border}`} color={T.muted} fontSize={10}>
//               <GitBranch size={9} /> {project.commits_count}
//             </Pill>
//           </div>
//         </div>
//         <div className={styles.projectHeaderRight}>
//           <span className={styles.projectActive}>
//             <span className={styles.projectActiveDot} /> Active
//           </span>
//           {project.github_url && (
//             <a
//               href={project.github_url}
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={e => e.stopPropagation()}
//               className={styles.projectGithubLink}
//             >
//               <Github size={14} />
//             </a>
//           )}
//         </div>
//       </div>
//       <p className={styles.projectDescription}>{project.description}</p>
//       <button
//         className={styles.projectViewBtn}
//         onClick={e => {
//           e.stopPropagation();
//           onView(project);
//         }}
//       >
//         View details <ChevronRight size={12} />
//       </button>
//     </GlassCard>
//   );
// }

// // ─── Main ─────────────────────────────────────────────────────────────────────
// export default function Dashboard() {
//   const dev   = MOCK_DEV;
//   const stats = MOCK_STATS;

//   const [projects,  setProjects]  = useState(MOCK_PROJECTS);
//   const [published, setPublished] = useState(dev.is_published);
//   const [pubModal,  setPubModal]  = useState(false);
//   const [pubDone,   setPubDone]   = useState(false);
//   const [analyzing, setAnalyzing] = useState(false);
//   const [activeTab, setActiveTab] = useState('projects');
//   const [query,     setQuery]     = useState('');
//   const [typeFilter,setTypeFilter]= useState('all');
//   const [testFilter,setTestFilter]= useState('all');
//   const [qf, setQf]               = useState({ highConf:false, mismatch:false, featured:false });
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [notification, setNotification] = useState(null);

//   const notify = (msg, type='info') => {
//     setNotification({ msg, type });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   const handleAnalyze = () => {
//     setAnalyzing(true);
//     setTimeout(() => { setAnalyzing(false); notify('Analysis complete ✅'); }, 2800);
//   };

//   const handlePublish = () => {
//     setPublished(p => !p);
//     setPubDone(true);
//     setTimeout(() => { setPubModal(false); setPubDone(false); }, 2200);
//     notify(published ? 'Profile is now private' : 'Profile is now public!');
//   };

//   const totalCommits = stats.total_commits;
//   const avgConf      = dev.average_confidence;
//   const topTech      = stats.primary_technologies;
//   const profileCompletion = Math.min(100, 20 + Math.min(projects.length, 2) * 40);

//   const availableTypes = [...new Set(projects.map(p=>p.ai_evaluation?.detected_project_type).filter(Boolean))].sort();

//   const filtered = projects.filter(p => {
//     const q = query.trim().toLowerCase();
//     if (q && ![p.name, p.description, p.language].filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
//     if (typeFilter !== 'all' && p.ai_evaluation?.detected_project_type !== typeFilter) return false;
//     if (testFilter === 'with-tests'    && p.ai_evaluation?.has_tests !== true)  return false;
//     if (testFilter === 'without-tests' && p.ai_evaluation?.has_tests !== false) return false;
//     if (qf.highConf  && (typeof p.ai_evaluation?.confidence_score !== 'number' || p.ai_evaluation.confidence_score < 80)) return false;
//     if (qf.featured  && (typeof p.ai_evaluation?.repo_score !== 'number' || p.ai_evaluation.repo_score < 80))             return false;
//     return true;
//   });

//   return (
//     <div className={styles.dashboardRoot}>
//       <style>{GLOBAL_CSS}</style>

//       {/* Ambient glow */}
//       <div className={styles.dashboardAmbientGlow} />

//       {/* ── Notification toast ── */}
//       {notification && (
//         <div className={styles.dashboardNotification}>
//           <Check size={14} color={T.green}/> {notification.msg}
//         </div>
//       )}

//       <div className={styles.dashboardContainer}>

//         {/* ── Page heading ── */}
//         <div className={styles.dashboardPageHeading}>
//           <p className={styles.dashboardWelcome}>Welcome back</p>
//           <h1 className={styles.dashboardTitle}>{dev.name}</h1>
//           <div className={styles.dashboardUsernameRow}>
//             <span className={styles.dashboardUsername}>@{dev.github_username}</span>
//             <Pill style={{ background: published ? 'rgba(34,211,138,0.12)' : 'rgba(255,255,255,0.06)', color: published ? T.green : T.muted, border:`1px solid ${published ? 'rgba(34,211,138,0.25)' : T.border}`, fontSize:10 }}>
//               {published ? <><Eye size={9}/> Public</> : <><EyeOff size={9}/> Private</>}
//             </Pill>
//             <div className={styles.dashboardProfileProgress}>
//               <div className={styles.dashboardProfileProgressFill} style={{ width: `${profileCompletion}%` }} />
//             </div>
//             <span className={styles.dashboardProfileProgressLabel}>Profile {profileCompletion}%</span>
//           </div>
//         </div>

//         {/* ── 3-col top grid ── */}
//         <div className={styles.dashboardTopGrid}>

//           {/* Profile card */}
//           <GlassCard hover={false} className={styles.glassCard + ' ' + styles.glassCardAnim1} onClick={undefined}>
//             <div className={styles.profileCardAccent} />
//             <div className={styles.profileCardHeader}>
//               <div className={styles.profileCardAvatarWrap}>
//                 <img src={dev.github_avatar} alt={dev.name} className={styles.profileCardAvatar}/>
//                 <span className={styles.profileCardAvatarStatus}/>
//               </div>
//               <div>
//                 <div className={styles.profileCardName}>{dev.name}</div>
//                 <Pill style={{ background:T.purpleDim, color:T.purple, border:`1px solid rgba(139,124,248,0.25)`, fontSize:10 }}>{dev.primary_role}</Pill>
//               </div>
//             </div>
//             <p className={styles.profileCardBio}>{dev.bio}</p>
//             <div className={styles.profileCardTech}>
//               <div className={styles.profileCardTechHeader}>
//                 <Cpu size={11} color={T.muted}/>
//                 <span className={styles.profileCardTechLabel}>Tech Stack</span>
//               </div>
//               <div className={styles.profileCardTechStack}>
//                 {dev.primary_stack.map(t=><TechBadge key={t} tech={t}/>)}
//               </div>
//             </div>
//             <div className={styles.profileCardStatsGrid}>
//               <StatBlock label="Experience" value={dev.experience_signal} accent={undefined} wide={false}/>
//               <StatBlock label="Verified" value={`${dev.verified_projects}/${projects.length}`} accent={T.green} wide={false}/>
//               <StatBlock label="Avg Confidence" value={`${avgConf}%`} accent={T.blue} wide={false}/>
//               <div className={styles.profileCardContribution}>
//                 <div className={styles.profileCardContributionLabel}>Contribution</div>
//                 <div className={styles.profileCardContributionRow}>
//                   <Pill style={{ background:T.purpleDim, color:T.purple, border:`1px solid rgba(139,124,248,0.2)`, fontSize:10 }}>Primary {dev.contribution_breakdown['Primary Builder']}</Pill>
//                   <Pill style={{ background:T.blueDim,   color:T.blue,   border:`1px solid rgba(59,158,255,0.2)`,  fontSize:10 }}>Major {dev.contribution_breakdown['Major Contributor']}</Pill>
//                   <Pill style={{ background:T.greenDim,  color:T.green,  border:`1px solid rgba(34,211,138,0.2)`,  fontSize:10 }}>Minor {dev.contribution_breakdown['Minor Contributor']}</Pill>
//                 </div>
//               </div>
//             </div>
//             <a href={`https://github.com/${dev.github_username}`} target="_blank" rel="noopener noreferrer" className={styles.profileCardGithub}>
//               <Github size={12}/> View on GitHub <ExternalLink size={10}/>
//             </a>
//           </GlassCard>

//           {/* Insights card */}
//           <GlassCard hover={false} className={styles.glassCard + ' ' + styles.glassCardAnim2} onClick={undefined}>
//             <div className={styles.insightsCardHeader}>
//               <div className={styles.quickActionsTitle} style={{ background: T.purpleDim }}>
//                 <Activity size={13} color={T.purple}/>
//               </div>
//               <span className={styles.quickActionsLabel}>Profile Insights</span>
//             </div>
//             <BarRow label="Repository Quality"        value={stats.repository_quality}        color={T.purple}/>
//             <BarRow label="Collaborative Development" value={stats.collaborative_development}  color={T.blue}/>
//             <div className={styles.insightsCardStatsGrid}>
//               <StatBlock label="Total Projects" value={stats.total_projects} accent={undefined} wide={false}/>
//               <StatBlock label="Skill Level" value={stats.overall_skill_level} accent={T.amber} wide={false}/>
//               <StatBlock label="Total Commits" value={totalCommits.toLocaleString()} accent={T.green} wide={false}/>
//               <div className={styles.profileCardContribution}>
//                 <div className={styles.insightsCardSectionLabel}>Top Tech</div>
//                 <div className={styles.profileCardContributionRow}>
//                   {topTech.slice(0,4).map(t=><TechBadge key={t} tech={t}/>)}
//                 </div>
//               </div>
//             </div>
//             <div className={styles.insightsCardSectionLabel}>Commit Activity</div>
//             <div className={styles.insightsCardActivity}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={ACTIVITY_DATA} barSize={12}>
//                   <XAxis dataKey="month" tick={{ fontSize:9, fill:T.muted }} axisLine={false} tickLine={false}/>
//                   <Bar dataKey="commits" radius={[4,4,0,0]} fill={T.purple} opacity={0.85}/>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//             <div className={styles.insightsCardLangLabel}>Language Split</div>
//             <div className={styles.insightsCardLangRow}>
//               <div className={styles.insightsCardLangPie}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={LANG_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={34} strokeWidth={0}>
//                       {LANG_DATA.map((d,i)=><Cell key={i} fill={d.color}/>)}
//                     </Pie>
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className={styles.insightsCardLangList}>
//                 {LANG_DATA.map(d=>(
//                   <div key={d.name} className={styles.insightsCardLangListItem}>
//                     <span className={styles.insightsCardLangDot} style={{ background:d.color }}/>
//                     <span className={styles.insightsCardLangName}>{d.name}</span>
//                     <span className={styles.insightsCardLangValue}>{d.value}%</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </GlassCard>

//           {/* Quick Actions */}
//           <GlassCard hover={false} className={styles.glassCardSmall + ' ' + styles.glassCardAnim3} onClick={undefined}>
//             <div className={styles.quickActionsHeader}>
//               <div className={styles.quickActionsTitle}>
//                 <Zap size={13} color={T.green}/>
//               </div>
//               <span className={styles.quickActionsLabel}>Quick Actions</span>
//             </div>
//             <div className={styles.quickActionsCol}>
//               <Btn icon={Plus} label="Add Project" variant="primary" onClick={()=>notify('Opening project import…')} disabled={false} small={false}/>
//               <Btn icon={analyzing ? Loader2 : RefreshCw} label={analyzing ? 'Analyzing…' : 'Analyze Projects'} disabled={analyzing} variant="outline" onClick={handleAnalyze} small={false}/>
//               <Btn icon={BarChart3} label="View Analyzer" variant="outline" onClick={()=>notify('Opening analyzer…')} disabled={false} small={false}/>
//               <Btn icon={FileUp} label="Upload CV" variant="outline" onClick={()=>notify('Opening CV upload…')} disabled={false} small={false}/>
//               <div className={styles.quickActionsDivider}/>
//               <Btn icon={published ? EyeOff : Eye} label={published ? 'Make Private' : 'Publish Profile'} variant={published ? 'danger' : 'outline'} onClick={()=>setPubModal(true)} disabled={false} small={false}/>
//               <Btn icon={Settings} label="Edit Profile" variant="outline" onClick={()=>notify('Opening profile editor…')} disabled={false} small={false}/>
//               <Btn icon={Settings} label="Settings" variant="outline" onClick={()=>notify('Opening settings…')} disabled={false} small={false}/>
//               <Btn icon={RotateCcw} label="Replay Intro" variant="outline" onClick={()=>notify('Starting intro tour…')} disabled={false} small={false}/>
//             </div>
//             {published && (
//               <div className={styles.quickActionsPublicUrl}>
//                 <p className={styles.quickActionsPublicUrlLabel}>Public URL</p>
//                 <a href="#" className={styles.quickActionsPublicUrlLink}>
//                   provenly.dev/{dev.github_username} <ExternalLink size={10}/>
//                 </a>
//               </div>
//             )}
//           </GlassCard>
//         </div>

//         {/* ── Projects section ── */}
//         <div style={{ animation:'db-fadeUp 0.38s ease 0.2s both' }}>
//           <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:10 }}>
//             <div>
//               <h2 style={{ fontFamily:'Instrument Serif, serif', fontSize:22, fontWeight:400, color:T.text, marginBottom:2 }}>Project Breakdown</h2>
//               <p style={{ fontSize:12, color:T.muted }}>{projects.length} repositories</p>
//             </div>
//             <Btn icon={Plus} label="Add Project" variant="primary" small={true} onClick={()=>notify('Opening project import…')} disabled={false}/>
//           </div>

//           {/* Tab bar */}
//           <div style={{ display:'flex', gap:4, marginBottom:16, background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:4, width:'fit-content' }}>
//             {['projects','education','experience'].map(t=>(
//               <button key={t} onClick={()=>setActiveTab(t)}
//                 style={{ padding:'7px 18px', borderRadius:10, fontSize:12, fontFamily:'Geist, sans-serif', cursor:'pointer', border:'none', fontWeight:500, transition:'all 0.15s', background: activeTab===t ? T.surfaceEl : 'transparent', color: activeTab===t ? T.text : T.muted, boxShadow: activeTab===t ? '0 2px 8px rgba(0,0,0,0.35)' : 'none' }}>
//                 {t.charAt(0).toUpperCase()+t.slice(1)}
//               </button>
//             ))}
//           </div>

//           {activeTab === 'projects' && (
//             <>
//               {/* Filter bar */}
//               <GlassCard hover={false} className={styles.glassCard + ' ' + styles.glassCardFilterBar} onClick={undefined}>
//                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
//                   {[
//                     { val:query, set:setQuery, placeholder:'Search projects…', type:'input' },
//                   ].map((_,i)=> i===0 && (
//                     <input key="q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects…"
//                       style={{ padding:'8px 12px', borderRadius:10, background:T.surfaceEl, border:`1px solid ${T.border}`, color:T.text, fontSize:12, fontFamily:'Geist, sans-serif', outline:'none' }}/>
//                   ))}
//                   <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
//                     style={{ padding:'8px 12px', borderRadius:10, background:T.surfaceEl, border:`1px solid ${T.border}`, color:T.text, fontSize:12, fontFamily:'Geist, sans-serif' }}>
//                     <option value="all">All types</option>
//                     {availableTypes.map(t=><option key={t} value={t}>{t}</option>)}
//                   </select>
//                   <select value={testFilter} onChange={e=>setTestFilter(e.target.value)}
//                     style={{ padding:'8px 12px', borderRadius:10, background:T.surfaceEl, border:`1px solid ${T.border}`, color:T.text, fontSize:12, fontFamily:'Geist, sans-serif' }}>
//                     <option value="all">All test status</option>
//                     <option value="with-tests">With tests</option>
//                     <option value="without-tests">Without tests</option>
//                   </select>
//                 </div>
//                 <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
//                   {[
//                     { key:'highConf', label:'High confidence 80%+' },
//                     { key:'featured', label:'Top quality 80%+'     },
//                   ].map(f=>(
//                     <button key={f.key} onClick={()=>setQf(p=>({...p,[f.key]:!p[f.key]}))}
//                       style={{ padding:'4px 12px', borderRadius:99, fontSize:11, fontFamily:'Geist, sans-serif', cursor:'pointer', border:`1px solid ${qf[f.key]?T.purple:T.border}`, background:qf[f.key]?T.purpleDim:T.surfaceEl, color:qf[f.key]?T.purple:T.mutedMid, transition:'all 0.15s' }}>
//                       {f.label}
//                     </button>
//                   ))}
//                 </div>
//                 <p style={{ fontSize:10, color:T.muted }}>Showing {filtered.length} of {projects.length} projects</p>
//               </GlassCard>

//               {filtered.length === 0 ? (
//                 <GlassCard hover={false} className={styles.glassCard + ' ' + styles.glassCardEmptyState} onClick={undefined}>
//                   <p style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:6 }}>No projects match</p>
//                   <p style={{ fontSize:12, color:T.muted, marginBottom:14 }}>Try clearing your filters.</p>
//                   <button onClick={()=>{setQuery('');setTypeFilter('all');setTestFilter('all');setQf({highConf:false,mismatch:false,featured:false});}}
//                     style={{ padding:'8px 18px', borderRadius:10, background:T.surfaceEl, border:`1px solid ${T.borderMid}`, color:T.text, fontSize:12, cursor:'pointer', fontFamily:'Geist, sans-serif' }}>
//                     Reset filters
//                   </button>
//                 </GlassCard>
//               ) : (
//                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
//                   {filtered.map((p,i)=>(
//                     <ProjectCard key={p.id} project={p} anim={0.05*i} onView={setSelectedProject}/>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {(activeTab === 'education' || activeTab === 'experience') && (
//             <GlassCard hover={false} className={styles.glassCard + ' ' + styles.glassCardEmptyState} onClick={undefined}>
//               <p style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:6 }}>Coming soon</p>
//               <p style={{ fontSize:12, color:T.muted }}>{activeTab.charAt(0).toUpperCase()+activeTab.slice(1)} details will appear here.</p>
//             </GlassCard>
//           )}
//         </div>
//       </div>

//       {/* ── Project detail modal ── */}
//       <Modal open={!!selectedProject} onClose={()=>setSelectedProject(null)}>
//         {selectedProject && (
//           <div>
//             <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
//               <span style={{ fontSize:16, fontWeight:600, color:T.text, fontFamily:'Geist, sans-serif' }}>{selectedProject.name}</span>
//               <Pill style={{ ...complexityColor(selectedProject.ai_evaluation?.difficulty_tier), border:'none', fontSize:10 }}>
//                 {selectedProject.ai_evaluation?.difficulty_tier}
//               </Pill>
//             </div>
//             <p style={{ fontSize:13, color:T.mutedMid, lineHeight:1.65, marginBottom:'1.25rem' }}>{selectedProject.description}</p>
//             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1rem' }}>
//               <StatBlock label="Repo Score" value={`${Math.round(selectedProject.ai_evaluation?.repo_score??0)}%`} accent={T.purple} wide={false}/>
//               <StatBlock label="Confidence" value={`${Math.round(selectedProject.ai_evaluation?.confidence_score??0)}%`} accent={T.blue} wide={false}/>
//               <StatBlock label="Contribution" value={`${Math.round(selectedProject.ai_evaluation?.contribution_percentage??0)}%`} accent={T.green} wide={false}/>
//               <StatBlock label="Commits" value={selectedProject.commits_count} accent={undefined} wide={false}/>
//             </div>
//             <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
//               <Pill style={{ background:T.surfaceEl, border:`1px solid ${T.border}`, color:T.mutedMid, fontSize:11 }}>
//                 {selectedProject.language}
//               </Pill>
//               {selectedProject.ai_evaluation?.detected_project_type && (
//                 <Pill style={{ background:T.blueDim, color:T.blue, border:`1px solid rgba(59,158,255,0.2)`, fontSize:11 }}>
//                   {selectedProject.ai_evaluation.detected_project_type}
//                 </Pill>
//               )}
//               <Pill style={{ background: selectedProject.ai_evaluation?.has_tests ? T.greenDim : T.amberDim, color: selectedProject.ai_evaluation?.has_tests ? T.green : T.amber, border:'none', fontSize:11 }}>
//                 {selectedProject.ai_evaluation?.has_tests ? 'Tests ✓' : 'No tests'}
//               </Pill>
//             </div>
//             {selectedProject.github_url && (
//               <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer"
//                 style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:14, fontSize:12, color:T.purple, textDecoration:'none' }}>
//                 <Github size={13}/> View on GitHub <ExternalLink size={11}/>
//               </a>
//             )}
//           </div>
//         )}
//       </Modal>

//       {/* ── Publish modal ── */}
//       <Modal open={pubModal} onClose={()=>{ if(!pubDone) setPubModal(false); }}>
//         {!pubDone ? (
//           <div>
//             <p style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:6 }}>{published?'Make Profile Private':'Publish Profile'}</p>
//             <p style={{ fontSize:13, color:T.mutedMid, marginBottom:'1.5rem', lineHeight:1.6 }}>
//               {published?'This will hide your profile from public view. You can re-publish at any time.':'This makes your developer profile publicly accessible to anyone with the link.'}
//             </p>
//             <div style={{ display:'flex', gap:10 }}>
//               <button onClick={()=>setPubModal(false)} style={{ flex:1, padding:'9px', borderRadius:12, background:T.surfaceEl, border:`1px solid ${T.borderMid}`, color:T.text, fontSize:13, cursor:'pointer', fontFamily:'Geist, sans-serif' }}>
//                 Cancel
//               </button>
//               <button onClick={handlePublish} style={{ flex:1, padding:'9px', borderRadius:12, background:published?T.coral:T.purple, border:'none', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'Geist, sans-serif', fontWeight:500 }}>
//                 {published?'Make Private':'Publish'}
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div style={{ textAlign:'center', padding:'0.5rem 0' }}>
//             <div style={{ width:48, height:48, borderRadius:'50%', background:T.greenDim, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
//               <Check size={22} color={T.green}/>
//             </div>
//             <p style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:4 }}>
//               {published ? 'Profile is now public!' : 'Profile is now private'}
//             </p>
//             {published && (
//               <a href="#" style={{ fontSize:12, color:T.purple, textDecoration:'none' }}>
//                 provenly.dev/{dev.github_username}
//               </a>
//             )}
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }