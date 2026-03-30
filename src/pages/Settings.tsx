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
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-label="Toggle setting"
        title="Toggle setting"
        className="sr-only peer"
      />
      <div className="w-10 h-6 bg-gray-200 dark:bg-neutral-700 rounded-full peer-checked:bg-purple-500 transition-colors duration-200" />
      <div className={`absolute left-0 top-0 w-6 h-6 bg-white dark:bg-neutral-900 rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-4 border-purple-500 border' : 'border-gray-300 border'}`}/>
    </label>
  );
}

function SettingRow({ icon: Icon, iconColor, iconBg, label, description, children, danger = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-2 py-3 rounded-lg ${danger ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/60'} transition-colors`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg || T.surfaceEl }}>
          <Icon size={16} color={iconColor || T.mutedMid} />
        </div>
        <div className="min-w-0">
          <div className={`font-medium text-sm truncate ${danger ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{label}</div>
          <div className="text-xs text-gray-500 dark:text-neutral-400 truncate">{description}</div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, iconColor, iconBg, children, style={} }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 mb-8 p-6" style={style}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg || T.surfaceEl }}>
          <Icon size={18} color={iconColor || T.mutedMid} />
        </div>
        <div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">{title}</div>
          {subtitle && <div className="text-xs text-gray-500 dark:text-neutral-300 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Btn({ label, onClick, disabled = false, variant = 'outline', icon: Icon, small, danger = false }) {
  const isPrimary = variant === 'primary';
  const isDanger  = variant === 'danger' || danger;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
        ${isPrimary ? 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600' : ''}
        ${isDanger ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' : ''}
        ${!isPrimary && !isDanger ? 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700' : ''}
        ${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isDangerous ? 'bg-red-100 dark:bg-red-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
          {isDangerous
            ? <AlertTriangle size={22} color={T.red} />
            : <Shield size={22} color={T.purple} />
          }
        </div>
        <div className="font-bold text-lg text-gray-900 dark:text-white mb-2">{title}</div>
        <p className="text-sm text-gray-500 dark:text-neutral-300 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 border border-neutral-700 rounded-xl px-6 py-3 flex items-center gap-2 text-sm font-medium text-white shadow-lg animate-bounceIn">
      <Check size={16} color={T.green} />
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
    <div className="relative min-h-screen w-full bg-gray-50 dark:bg-neutral-900 flex flex-col items-center py-8 px-2 md:px-8">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-purple-200/20 via-transparent to-blue-200/10 dark:from-purple-900/20 dark:to-blue-900/10" />
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Topbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors" onClick={() => window.history.back()}>
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900">
                <SettingsIcon size={18} color={T.purple} />
              </span>
              <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Settings</span>
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
        <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">

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
          <div className="rounded-2xl border border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-900/10 overflow-hidden mb-8">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-red-200 dark:border-red-800">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} color={T.red} />
              </div>
              <div>
                <div className="font-bold text-sm text-red-600">Danger Zone</div>
                <div className="text-xs text-red-400 mt-0.5">These actions are destructive and may be irreversible</div>
              </div>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4">
              {/* Unpublish */}
              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <div className="text-[13px] font-medium text-gray-900 dark:text-white mb-1">Unpublish profile</div>
                  <div className="text-xs text-gray-500 dark:text-neutral-400 max-w-xs leading-snug">Your profile will be hidden from public view. You can re-publish at any time.</div>
                </div>
                <Btn label="Unpublish" onClick={() => openConfirm('unpublish')} icon={EyeOff} small danger disabled={false} />
              </div>
              {/* Deactivate */}
              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <div className="text-[13px] font-medium text-gray-900 dark:text-white mb-1">Deactivate account</div>
                  <div className="text-xs text-gray-500 dark:text-neutral-400 max-w-xs leading-snug">Temporarily disable your account. Reactivate by signing back in.</div>
                </div>
                <Btn label="Deactivate" onClick={() => openConfirm('deactivate')} icon={UserX} small danger disabled={false} />
              </div>
              {/* Delete */}
              <div className="flex items-center justify-between gap-4 py-2 border-b-0 pb-0">
                <div>
                  <div className="text-[13px] font-semibold text-red-600 mb-1">Delete account</div>
                  <div className="text-xs text-gray-500 dark:text-neutral-400 max-w-xs leading-snug">Permanently delete your account and all data. <strong className="text-red-500">This cannot be undone.</strong></div>
                </div>
                <Btn label="Delete" onClick={() => openConfirm('delete')} icon={Trash2} small danger disabled={false} />
              </div>
            </div>
          </div>

          {/* ── Bottom save bar ── */}
          <div className="sticky bottom-0 left-0 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-t border-gray-200 dark:border-neutral-800 flex justify-end py-4 px-2 md:px-0 z-20">
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
