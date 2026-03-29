import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import type { UserSettings } from '@/types/api';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState<UserSettings>(settings);
  const [saving, setSaving] = useState(false);

  // sync form when settings change
  useEffect(() => {
    setForm({
      profile_visibility: 'private',
      ...settings,
    });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
    } catch {
      return;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-2xl">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card p-8 shadow-lg"
        >
          <h1 className="text-heading-md mb-6">Settings</h1>

          <div className="space-y-6">
            <div>
              <Checkbox
                id="email_notifications"
                checked={!!form.email_notifications}
                onCheckedChange={(c) => setForm((prev) => ({ ...prev, email_notifications: c === true }))}
              />
              <Label htmlFor="email_notifications" className="ml-2">
                Email notifications
              </Label>
              <p className="ml-7 text-caption text-muted-foreground">
                Get important account and project updates.
              </p>
            </div>

            <div>
              <Checkbox
                id="marketing_emails"
                checked={!!form.marketing_emails}
                onCheckedChange={(c) => setForm((prev) => ({ ...prev, marketing_emails: c === true }))}
              />
              <Label htmlFor="marketing_emails" className="ml-2">
                Marketing emails
              </Label>
              <p className="ml-7 text-caption text-muted-foreground">
                Receive product news, feature launches, and tips.
              </p>
            </div>

            <div>
              <Checkbox
                id="weekly_digest"
                checked={!!form.weekly_digest}
                onCheckedChange={(c) => setForm((prev) => ({ ...prev, weekly_digest: c === true }))}
              />
              <Label htmlFor="weekly_digest" className="ml-2">
                Weekly digest
              </Label>
              <p className="ml-7 text-caption text-muted-foreground">
                Get a weekly summary of profile views, activity, and signals.
              </p>
            </div>

            <div>
              <Checkbox
                id="security_alerts"
                checked={!!form.security_alerts}
                onCheckedChange={(c) => setForm((prev) => ({ ...prev, security_alerts: c === true }))}
              />
              <Label htmlFor="security_alerts" className="ml-2">
                Security alerts
              </Label>
              <p className="ml-7 text-caption text-muted-foreground">
                Receive alerts for important security events.
              </p>
            </div>

            <div>
              <Checkbox
                id="allow_hire_requests"
                checked={!!form.allow_hire_requests}
                onCheckedChange={(c) => setForm((prev) => ({ ...prev, allow_hire_requests: c === true }))}
              />
              <Label htmlFor="allow_hire_requests" className="ml-2">
                Allow hire requests
              </Label>
              <p className="ml-7 text-caption text-muted-foreground">
                Let founders send you hiring inquiries.
              </p>
            </div>

            <div>
              <Label htmlFor="profile_visibility" className="mb-2 block text-body-sm font-medium">
                Profile visibility (public / private)
              </Label>
              <Select
                value={form.profile_visibility || 'private'}
                onValueChange={(value: 'public' | 'private') => setForm((prev) => ({ ...prev, profile_visibility: value }))}
              >
                <SelectTrigger id="profile_visibility" className="w-full sm:w-52">
                  <SelectValue placeholder="Choose visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-caption text-muted-foreground">
                Control who can view your profile.
              </p>
            </div>

            <div>
              <Checkbox
                id="temporarily_close_account"
                checked={!!form.temporarily_close_account}
                onCheckedChange={(c) => setForm((prev) => ({ ...prev, temporarily_close_account: c === true }))}
              />
              <Label htmlFor="temporarily_close_account" className="ml-2">
                Temporarily close account
              </Label>
              <p className="ml-7 text-caption text-muted-foreground">
                Hide your profile and pause account activity for a period.
              </p>
            </div>

            <div>
              <Label htmlFor="temporary_close_reason" className="mb-2 block text-body-sm font-medium">
                Temporary close reason
              </Label>
              <Input
                id="temporary_close_reason"
                value={form.temporary_close_reason || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, temporary_close_reason: e.target.value }))}
                placeholder="Optional note for why your account is temporarily closed"
              />
              <p className="text-caption text-muted-foreground">
                Optional note for why your account is temporarily closed.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="mb-3 text-body-sm font-medium">Reopen account</p>
              <p className="mb-3 text-caption text-muted-foreground">
                Restore normal visibility and resume activity.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm((prev) => ({
                  ...prev,
                  temporarily_close_account: false,
                  temporary_close_reason: '',
                }))}
              >
                Reopen account
              </Button>
            </div>

            <div>
              <Checkbox
                id="include_org_repos"
                checked={!!form.include_org_repos}
                onCheckedChange={(c) => setForm(prev => ({ ...prev, include_org_repos: c === true }))}
              />
              <Label htmlFor="include_org_repos" className="ml-2">
                Include organization repositories?
              </Label>
              <p className="text-caption text-muted-foreground ml-7">
                If you don’t want organization projects mixed into the list, keep this off.
              </p>
            </div>

            <div>
              <Label htmlFor="queue_threshold" className="mb-2 block text-body-sm font-medium">
                Import queue threshold
              </Label>
              <Input
                id="queue_threshold"
                type="number"
                value={form.import_queue_threshold ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, import_queue_threshold: Number(e.target.value) || 0 }))}
                className="w-32"
                min={0}
              />
              <p className="text-caption text-muted-foreground">
                Above this many repos, imports run in the background.
              </p>
            </div>

            <div>
              <Checkbox
                id="run_ai_by_default"
                checked={!!form.run_ai_by_default}
                onCheckedChange={(c) => setForm(prev => ({ ...prev, run_ai_by_default: c === true }))}
              />
              <Label htmlFor="run_ai_by_default" className="ml-2">
                Run AI evaluation by default
              </Label>
            </div>

            <div>
              <Checkbox
                id="auto_publish_on_complete"
                checked={!!form.auto_publish_on_complete}
                onCheckedChange={(c) => setForm(prev => ({ ...prev, auto_publish_on_complete: c === true }))}
              />
              <Label htmlFor="auto_publish_on_complete" className="ml-2">
                Auto-publish profile after completion
              </Label>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>

            </div>
          </div> {/* Close main settings div before Danger Zone */}

          {/* Danger Zone Section */}
          <div className="mt-12">
            <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6">
              <h2 className="text-heading-sm font-bold text-red-700 mb-4">Danger Zone</h2>
              <p className="text-caption text-red-700 mb-6">These actions are destructive and may be irreversible. Please proceed with caution.</p>

              {/* Unpublish Profile */}
              <DangerAction
                actionLabel="Unpublish Profile"
                description="Your profile will be hidden from public view. You can re-publish at any time."
                buttonText="Unpublish"
                onConfirm={async () => {
                  try {
                    const { unpublishProfile } = await import('@/lib/api');
                    await unpublishProfile();
                    window.location.reload();
                  } catch (e) {
                    alert('Failed to unpublish profile.');
                  }
                }}
              />

              {/* Deactivate Account */}
              <DangerAction
                actionLabel="Deactivate Account"
                description="Temporarily disable your account. You can reactivate by logging in again."
                buttonText="Deactivate"
                onConfirm={async () => {
                  // TODO: Implement deactivate API call
                  alert('Deactivate account is not yet implemented.');
                }}
              />

              {/* Delete Account */}
              <DangerAction
                actionLabel="Delete Account"
                description="Permanently delete your account and all associated data. This cannot be undone."
                buttonText="Delete"
                onConfirm={async () => {
                  // TODO: Implement delete API call
                  alert('Delete account is not yet implemented.');
                }}
                destructive
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// DangerAction component using AlertDialog
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

function DangerAction({ actionLabel, description, buttonText, onConfirm, destructive }: {
  actionLabel: string;
  description: string;
  buttonText: string;
  onConfirm: () => Promise<void>;
  destructive?: boolean;
}) {
  return (
    <div className="mb-6">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={destructive ? 'destructive' : 'outline'} className="border-red-500 text-red-700 hover:bg-red-100">
            {buttonText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>{buttonText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
