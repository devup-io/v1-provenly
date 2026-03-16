import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  // sync form when settings change
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
    } catch (e) {
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
