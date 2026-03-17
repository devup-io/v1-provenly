import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentDeveloper, updateDeveloperProfile, getSupportedDevTypes, isAuthError, clearAuth } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import type { DeveloperProfile } from '@/types/api';

const BIO_MIN = 200;
const BIO_MAX = 1000;

export default function EditProfile() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [supportedRoles, setSupportedRoles] = useState<string[]>([]);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [form, setForm] = useState({
    name: '',
    primary_role: '',
    primary_stack: '',
    bio: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [dev, roles] = await Promise.all([
          getCurrentDeveloper(),
          getSupportedDevTypes().catch(() => [] as string[]),
        ]);

        setDeveloper(dev);
        setSupportedRoles(roles);
        setForm({
          name: dev.name || '',
          primary_role: dev.primary_role || '',
          primary_stack: Array.isArray(dev.primary_stack) ? dev.primary_stack.join(', ') : '',
          bio: dev.bio || '',
        });
      } catch (err) {
        if (isAuthError(err)) {
          clearAuth();
          navigate('/signup?error=session_expired', { replace: true });
          return;
        }
        setLoadError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

  const parsedStack = useMemo(
    () => form.primary_stack.split(',').map((item) => item.trim()).filter(Boolean),
    [form.primary_stack]
  );

  const roleInvalid =
    !!form.primary_role && supportedRoles.length > 0 && !supportedRoles.includes(form.primary_role);

  const bioLength = form.bio.trim().length;
  const bioInvalid = bioLength < BIO_MIN || bioLength > BIO_MAX;
  const hasRequiredFields = !!form.name.trim() && !!form.primary_role.trim() && parsedStack.length > 0;
  const canSave = hasRequiredFields && !roleInvalid && !bioInvalid && !saving;

  const handleSave = async () => {
    if (!developer || !canSave) return;

    try {
      setSaving(true);
      setSubmitError(null);

      await updateDeveloperProfile(
        developer.id,
        {
          name: form.name.trim(),
          primary_role: form.primary_role.trim(),
          primary_stack: parsedStack,
          bio: form.bio.trim(),
        },
        settings
      );

      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-24 sm:px-6 md:px-8 md:pt-28">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-display-sm">Edit Profile</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          {loadError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {loadError}
            </div>
          )}
          {submitError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <Label htmlFor="name" className="mb-2 block">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="role" className="mb-2 block">Primary Role</Label>
              <Input
                id="role"
                value={form.primary_role}
                onChange={(e) => setForm((prev) => ({ ...prev, primary_role: e.target.value }))}
                placeholder="e.g. Backend Developer"
              />
              {roleInvalid && (
                <p className="mt-2 text-sm text-destructive">
                  This role is not currently supported. Supported roles: {supportedRoles.join(', ')}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="stack" className="mb-2 block">Primary Stack</Label>
              <Input
                id="stack"
                value={form.primary_stack}
                onChange={(e) => setForm((prev) => ({ ...prev, primary_stack: e.target.value }))}
                placeholder="Comma-separated, e.g. React, TypeScript, Node.js"
              />
              <p className="mt-1 text-caption text-muted-foreground">At least one technology is required.</p>
            </div>

            <div>
              <Label htmlFor="bio" className="mb-2 block">Bio</Label>
              <Textarea
                id="bio"
                rows={8}
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Write a professional bio about your experience, work style, and strengths."
              />
              <p className={`mt-1 text-caption ${bioInvalid ? 'text-destructive' : 'text-muted-foreground'}`}>
                {bioLength}/{BIO_MAX} characters (required: {BIO_MIN}–{BIO_MAX})
              </p>
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={!canSave} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
