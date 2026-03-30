// ─── Color Tokens (copied from analyzer-theme.css) ─────────────
const T = {
  bg: '#0d0d0f',
  surface: '#131316',
  surfaceEl: '#1a1a1e',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  text: '#f0f0f2',
  muted: '#6b6b75',
  mutedMid: '#9494a0',
  purple: '#8b82f0',
  purpleDim: '#2a2640',
  green: '#34c780',
  greenDim: '#162a20',
  amber: '#f5a623',
  amberDim: '#2a1f0a',
  blue: '#4a9eff',
  blueDim: '#0f1e30',
  coral: '#ff6b4a',
  coralDim: '#2a1510',
  red: '#ff6b6b',
  redDim: '#2a1510',
  redMid: 'rgba(255,107,107,0.22)',
};

/**
 * Settings.jsx — Redesigned dark-theme settings page
 * Standalone with mock data. No external API/router deps required.
 * Fonts: Syne (headings) + DM Sans (body) — same as the rest of the app.
 */

import { useState } from 'react';
import {
  Bell, Mail, BookOpen, Shield, UserCheck,
  Eye, EyeOff, Clock, GitBranch, Cpu,
  Zap, ChevronLeft, Save, AlertTriangle,
  Trash2, UserX, X, Check, RefreshCw,
  Globe, Lock, Settings as SettingsIcon,
} from 'lucide-react';


// ─── Mock initial settings ────────────────────────────────────────────────────
const INITIAL = {
  email_notifications:       true,
  marketing_emails:          false,
  weekly_digest:             true,
  security_alerts:           true,
  allow_hire_requests:       true,
  profile_visibility:        'public',
  temporarily_close_account: false,
  temporary_close_reason:    '',
  include_org_repos:         false,
  import_queue_threshold:    10,
  run_ai_by_default:         true,
  auto_publish_on_complete:  false,
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }) {
  return (
    <label className="st-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-label="Toggle setting"
        title="Toggle setting"
      />
      <div className="st-toggle-track" />
      <div className={`st-toggle-thumb${checked ? ' st-toggle-thumb-checked' : ''}`} />
    </label>
  );
}

function SettingRow({ icon: Icon, iconColor, iconBg, label, description, children, danger = false }) {
  return (
    <div className={`st-setting-row${danger ? ' st-setting-row-danger' : ''}`}>
      <div className="st-setting-row-left">
        <div className="st-setting-row-icon" style={{ background: iconBg || T.surfaceEl }}>
          <Icon size={15} color={iconColor || T.mutedMid} />
        </div>
        <div className="st-setting-row-labels">
          <div className="st-setting-row-label" style={{ color: danger ? T.red : T.text }}>{label}</div>
          <div className="st-setting-row-desc">{description}</div>
        </div>
      </div>
      <div className="st-setting-row-right">{children}</div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, iconColor, iconBg, children, style={} }) {
  return (
    <div className="st-section" style={style}>
      <div className="st-section-header">
        <div className="st-section-header-icon" style={{ background: iconBg || T.surfaceEl }}>
          <Icon size={15} color={iconColor || T.mutedMid} />
        </div>
        <div>
          <div className="st-section-header-title">{title}</div>
          {subtitle && <div className="st-section-header-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="st-section-content">{children}</div>
    </div>
  );
}

function Btn({ label, onClick, disabled = false, variant = 'outline', icon: Icon, small, danger = false }) {
  const [hov, setHov] = useState(false);
  const isPrimary = variant === 'primary';
  const isDanger  = variant === 'danger' || danger;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`st-btn${isPrimary ? ' st-btn-primary' : ''}${isDanger ? ' st-btn-danger' : ''}${small ? ' st-btn-small' : ''}${hov ? ' st-btn-hov' : ''}`}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmModal({ open, onClose, title, description, confirmLabel, onConfirm, isDangerous, loading }) {
  if (!open) return null;
  return (
    <div className="st-backdrop" style={{ zIndex:200 }}>
      <div className="st-modal">
        <button
          onClick={onClose}
          className="st-modal-close-btn"
          title="Close"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        {/* Icon */}
        <div style={{ width:44, height:44, borderRadius:14, background: isDangerous ? T.redDim : T.purpleDim, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
          {isDangerous
            ? <AlertTriangle size={20} color={T.red} />
            : <Shield size={20} color={T.purple} />
          }
        </div>
        <div style={{ fontFamily:'Syne, sans-serif', fontSize:17, fontWeight:700, color:T.text, marginBottom:8 }}>{title}</div>
        <p style={{ fontSize:13, color:T.muted, lineHeight:1.65, marginBottom:'1.5rem' }}>{description}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn label="Cancel" onClick={onClose} variant="outline" icon={undefined} small={false} />
          <Btn
            label={loading ? 'Processing…' : confirmLabel}
            onClick={onConfirm}
            disabled={loading}    
                    small={false}

            variant={isDangerous ? 'danger' : 'primary'}
            icon={loading ? undefined : isDangerous ? Trash2 : Check}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Save Toast ───────────────────────────────────────────────────────────────

function SaveToast({ visible }) {
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:300, background:T.surfaceEl, border:`1px solid ${T.borderMid}`, borderRadius:14, padding:'10px 20px', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500, color:T.text, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'st-popIn 0.25s ease both', whiteSpace:'nowrap' }}>
      <Check size={14} color={T.green} />
      Settings saved
    </div>
  );
}

// ─── Visibility Select ────────────────────────────────────────────────────────

function VisibilitySelect({ value, onChange }) {
  const isPublic = value === 'public';
  return (
    <div style={{ display:'flex', gap:6 }}>
      {['public','private'].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:99, fontSize:12, fontWeight:500, fontFamily:'DM Sans, sans-serif', cursor:'pointer', transition:'all 0.15s',
            background: value === v ? (v === 'public' ? T.greenDim : T.purpleDim) : T.surfaceEl,
            border: `1px solid ${value === v ? (v === 'public' ? 'hsla(152,68%,52%,0.3)' : 'hsla(252,70%,72%,0.3)') : T.border}`,
            color: value === v ? (v === 'public' ? T.green : T.purple) : T.muted,
          }}
        >
          {v === 'public' ? <Globe size={11} /> : <Lock size={11} />}
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ─── Number input ─────────────────────────────────────────────────────────────

function NumInput({ value, onChange, min=0, max=999 }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(Number(e.target.value) || 0)}
      className="st-num-input"
      title="Set import queue threshold"
      placeholder="Enter number"
    />
  );
}

// ─── Text input ───────────────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'9px 13px', borderRadius:12, background:T.surfaceEl, border:`1px solid ${T.borderMid}`, color:T.text, fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none' }}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving]     = useState(false);
  const [toast,  setToast]      = useState(false);

  // Confirmation modal state
  const [modal, setModal] = useState(null);
  // { type: 'unpublish' | 'deactivate' | 'delete' | 'reopen' | 'save', loading: false }

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900)); // mock API
    setSaving(false);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const openConfirm = (type) => setModal({ type, loading: false });
  const closeModal  = () => setModal(null);

  const handleConfirm = async () => {
    setModal(m => ({ ...m, loading: true }));
    await new Promise(r => setTimeout(r, 1100)); // mock API
    if (modal?.type === 'unpublish')   set('profile_visibility', 'private');
    if (modal?.type === 'reopen')      { set('temporarily_close_account', false); set('temporary_close_reason', ''); }
    setModal(null);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const MODAL_CONFIG = {
    save:       { title:'Save settings?', description:'Your preferences will be updated immediately.', confirmLabel:'Save', isDangerous:false },
    unpublish:  { title:'Unpublish profile?', description:'Your profile will be hidden from public view. You can re-publish at any time from the dashboard.', confirmLabel:'Unpublish', isDangerous:true },
    deactivate: { title:'Deactivate account?', description:'Your account will be temporarily disabled. You can reactivate by signing back in.', confirmLabel:'Deactivate', isDangerous:true },
    delete:     { title:'Delete account permanently?', description:'This will permanently delete your account and all associated data. This action cannot be undone and there is no recovery option.', confirmLabel:'Delete forever', isDangerous:true },
    reopen:     { title:'Reopen account?', description:'This will restore normal visibility and resume all account activity.', confirmLabel:'Reopen', isDangerous:false },
  };

  const cfg = modal ? MODAL_CONFIG[modal.type] : null;

  return (
    <div className="st-root">
      <div className="st-ambient-glow" />
      <div className="st-page-inner">
        <div className="st-topbar">
          <div className="st-topbar-left">
            <button className="st-back-btn" onClick={() => window.history.back()}>
              <ChevronLeft size={14} /> Back
            </button>
            <div className="st-topbar-title">
              <div className="st-topbar-icon">
                <SettingsIcon size={15} color={T.purple} />
              </div>
              <span className="st-topbar-heading">Settings</span>
            </div>
          </div>
          <Btn
            label={saving ? 'Saving…' : 'Save Preferences'}
            onClick={() => openConfirm('save')}
            disabled={saving}
            variant="primary"
            icon={saving ? undefined : Save}
            small={false}
          />
        </div>
        <div className="st-main-cols">

          {/* ── Notifications ── */}
          <SectionCard title="Notifications" subtitle="Control how we reach you" icon={Bell} iconColor={T.blue} iconBg={T.blueDim}>
            <SettingRow icon={Mail} iconColor={T.blue} iconBg={T.blueDim} label="Email notifications" description="Get important account and project updates.">
              <Toggle checked={form.email_notifications} onChange={v => set('email_notifications', v)} id="email_notifs" />
            </SettingRow>
            <SettingRow icon={BookOpen} iconColor={T.amber} iconBg={T.amberDim} label="Marketing emails" description="Receive product news, feature launches, and tips.">
              <Toggle checked={form.marketing_emails} onChange={v => set('marketing_emails', v)} id="mkt_emails" />
            </SettingRow>
            <SettingRow icon={RefreshCw} iconColor={T.purple} iconBg={T.purpleDim} label="Weekly digest" description="A weekly summary of profile views, activity, and signals.">
              <Toggle checked={form.weekly_digest} onChange={v => set('weekly_digest', v)} id="weekly" />
            </SettingRow>
            <SettingRow icon={Shield} iconColor={T.green} iconBg={T.greenDim} label="Security alerts" description="Receive alerts for important security events.">
              <Toggle checked={form.security_alerts} onChange={v => set('security_alerts', v)} id="sec_alerts" />
            </SettingRow>
          </SectionCard>

          {/* ── Profile & Visibility ── */}
          <SectionCard title="Profile & Visibility" subtitle="Manage who can find and contact you" icon={Eye} iconColor={T.green} iconBg={T.greenDim}>
            <SettingRow icon={UserCheck} iconColor={T.purple} iconBg={T.purpleDim} label="Allow hire requests" description="Let founders and recruiters send you hiring inquiries.">
              <Toggle checked={form.allow_hire_requests} onChange={v => set('allow_hire_requests', v)} id="hire_req" />
            </SettingRow>
            <SettingRow icon={Globe} iconColor={T.green} iconBg={T.greenDim} label="Profile visibility" description="Control whether your profile is publicly accessible.">
              <VisibilitySelect value={form.profile_visibility} onChange={v => set('profile_visibility', v)} />
            </SettingRow>
          </SectionCard>

          {/* ── Account Status ── */}
          <SectionCard title="Account Status" subtitle="Temporarily pause your account" icon={Clock} iconColor={T.amber} iconBg={T.amberDim}>
            <SettingRow icon={EyeOff} iconColor={T.amber} iconBg={T.amberDim} label="Temporarily close account" description="Hide your profile and pause all account activity.">
              <Toggle checked={form.temporarily_close_account} onChange={v => set('temporarily_close_account', v)} id="temp_close" />
            </SettingRow>

            {/* Close reason — shown when temporarily closed */}
            {form.temporarily_close_account && (
              <div className="st-reason-row">
                <div className="st-reason-label">Reason (optional)</div>
                <TextInput
                  value={form.temporary_close_reason}
                  onChange={v => set('temporary_close_reason', v)}
                  placeholder="Optional note about why you're pausing…"
                />
              </div>
            )}

            {/* Reopen section */}
            <div className="st-reopen-row">
              <div>
                <div className="st-reopen-label">Reopen account</div>
                <div className="st-reopen-desc">Restore normal visibility and resume activity.</div>
              </div>
              <Btn label="Reopen account" onClick={() => openConfirm('reopen')} icon={RefreshCw} small />
            </div>
          </SectionCard>

          {/* ── Import & AI ── */}
          <SectionCard title="Import & AI" subtitle="Repository import and analysis behaviour" icon={GitBranch} iconColor={T.purple} iconBg={T.purpleDim}>
            <SettingRow icon={GitBranch} iconColor={T.mutedMid} iconBg={T.surfaceEl} label="Include organisation repositories" description="Mix organisation projects into your imported repository list.">
              <Toggle checked={form.include_org_repos} onChange={v => set('include_org_repos', v)} id="org_repos" />
            </SettingRow>
            <SettingRow icon={Cpu} iconColor={T.blue} iconBg={T.blueDim} label="Run AI evaluation by default" description="Automatically run AI analysis on every newly imported repository.">
              <Toggle checked={form.run_ai_by_default} onChange={v => set('run_ai_by_default', v)} id="ai_default" />
            </SettingRow>
            <SettingRow icon={Zap} iconColor={T.amber} iconBg={T.amberDim} label="Auto-publish after completion" description="Publish your profile automatically once analysis is finished.">
              <Toggle checked={form.auto_publish_on_complete} onChange={v => set('auto_publish_on_complete', v)} id="auto_pub" />
            </SettingRow>
            <SettingRow icon={GitBranch} iconColor={T.mutedMid} iconBg={T.surfaceEl} label="Import queue threshold" description="Above this number of repos, imports run in the background queue.">
              <NumInput value={form.import_queue_threshold} onChange={v => set('import_queue_threshold', v)} min={0} max={500} />
            </SettingRow>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <div className="st-section" style={{ borderRadius:20, border:`1px solid ${T.redMid}`, background:`hsla(0,72%,60%,0.04)`, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.redMid}`, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:T.redDim, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <AlertTriangle size={15} color={T.red} />
              </div>
              <div>
                <div style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:700, color:T.red }}>Danger Zone</div>
                <div style={{ fontSize:11, color:`hsla(0,72%,60%,0.65)`, marginTop:1 }}>These actions are destructive and may be irreversible</div>
              </div>
            </div>

            <div style={{ padding:'4px 20px 16px' }}>
              {/* Unpublish */}
              <div className="st-danger-row">
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:T.text, marginBottom:3 }}>Unpublish profile</div>
                  <div style={{ fontSize:12, color:T.muted, maxWidth:340, lineHeight:1.55 }}>Your profile will be hidden from public view. You can re-publish at any time.</div>
                </div>
                <Btn label="Unpublish" onClick={() => openConfirm('unpublish')} icon={EyeOff} small danger disabled={false} />
              </div>

              {/* Deactivate */}
              <div className="st-danger-row">
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:T.text, marginBottom:3 }}>Deactivate account</div>
                  <div style={{ fontSize:12, color:T.muted, maxWidth:340, lineHeight:1.55 }}>Temporarily disable your account. Reactivate by signing back in.</div>
                </div>
                <Btn label="Deactivate" onClick={() => openConfirm('deactivate')} icon={UserX} small danger disabled={false} />
              </div>

              {/* Delete */}
              <div className="st-danger-row" style={{ borderBottom:'none', paddingBottom:0 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.red, marginBottom:3 }}>Delete account</div>
                  <div style={{ fontSize:12, color:T.muted, maxWidth:340, lineHeight:1.55 }}>Permanently delete your account and all data. <strong style={{ color:`hsla(0,72%,60%,0.8)` }}>This cannot be undone.</strong></div>
                </div>
                <Btn label="Delete" onClick={() => openConfirm('delete')} icon={Trash2} small danger disabled={false} />
              </div>
            </div>
          </div>

          {/* ── Bottom save bar ── */}
          <div className="st-bottom-save">
            <Btn
              label={saving ? 'Saving…' : 'Save Preferences'}
              onClick={() => openConfirm('save')}
              disabled={saving}
              variant="primary"
              icon={saving ? undefined : Save}
              small={false}
            />
          </div>

        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {cfg && (
        <ConfirmModal
          open={!!modal}
          onClose={closeModal}
          title={cfg.title}
          description={cfg.description}
          confirmLabel={cfg.confirmLabel}
          isDangerous={cfg.isDangerous}
          loading={modal?.loading}
          onConfirm={modal?.type === 'save' ? async () => { closeModal(); await handleSave(); } : handleConfirm}
        />
      )}

      {/* ── Save toast ── */}
      <SaveToast visible={toast} />
    </div>
  );
}
