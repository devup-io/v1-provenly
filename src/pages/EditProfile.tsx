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

const COMMON_TECH_STACK = [
  'React',
  'Vue.js',
  'Angular',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'Next.js',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'Java',
  'Spring Boot',
  'Go',
  'Rust',
  'C#',
  '.NET',
  'Kotlin',
  'Swift',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'GraphQL',
  'TailwindCSS',
  'Terraform',
  'CI/CD',
];

const LANGUAGE_OPTIONS = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C#',
  'Kotlin',
  'Swift',
  'PHP',
  'Ruby',
  'C++',
  'Dart',
  'SQL',
];

const TECH_TO_LANGUAGES: Record<string, string[]> = {
  React: ['TypeScript', 'JavaScript'],
  'Vue.js': ['TypeScript', 'JavaScript'],
  Angular: ['TypeScript', 'JavaScript'],
  TypeScript: ['TypeScript', 'JavaScript'],
  JavaScript: ['JavaScript', 'TypeScript'],
  'Node.js': ['JavaScript', 'TypeScript'],
  Express: ['JavaScript', 'TypeScript'],
  'Next.js': ['JavaScript', 'TypeScript'],
  Python: ['Python'],
  Django: ['Python'],
  Flask: ['Python'],
  FastAPI: ['Python'],
  Java: ['Java'],
  'Spring Boot': ['Java'],
  Go: ['Go'],
  Rust: ['Rust'],
  'C#': ['C#'],
  '.NET': ['C#'],
  Kotlin: ['Kotlin'],
  Swift: ['Swift'],
  PostgreSQL: ['SQL'],
  MySQL: ['SQL'],
  MongoDB: ['JavaScript', 'TypeScript'],
  Redis: ['SQL'],
  Docker: ['Go', 'Python', 'JavaScript', 'TypeScript'],
  Kubernetes: ['Go', 'Python'],
  AWS: ['TypeScript', 'Python', 'Java'],
  GCP: ['TypeScript', 'Python', 'Java'],
  Azure: ['TypeScript', 'Python', 'C#'],
  GraphQL: ['TypeScript', 'JavaScript'],
  TailwindCSS: ['TypeScript', 'JavaScript'],
  Terraform: ['Go', 'Python'],
  'CI/CD': ['TypeScript', 'Python', 'Go'],
};

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
    bio: '',
  });
  const [techQuery, setTechQuery] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

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
        const initialStack = Array.isArray(dev.primary_stack) ? dev.primary_stack : [];
        const initialLanguages = initialStack.filter((item) => LANGUAGE_OPTIONS.includes(item));
        const initialTechStack = initialStack.filter((item) => !LANGUAGE_OPTIONS.includes(item));

        setSelectedLanguages(initialLanguages);
        setTechStack(initialTechStack);
        setForm({
          name: dev.name || '',
          primary_role: dev.primary_role || '',
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

  const roleInvalid =
    !!form.primary_role && supportedRoles.length > 0 && !supportedRoles.includes(form.primary_role);

  const bioLength = form.bio.trim().length;
  const bioInvalid = bioLength < BIO_MIN || bioLength > BIO_MAX;
  const hasRequiredFields = !!form.name.trim() && !!form.primary_role.trim() && techStack.length > 0;
  const canSave = hasRequiredFields && !roleInvalid && !bioInvalid && !saving;

  const longBioTemplate = useMemo(() => {
    const displayName = form.name.trim() || developer?.github_username || 'I';
    const role = form.primary_role.trim() || 'software engineer';
    const stack = techStack.length > 0 ? techStack.join(', ') : 'modern web technologies';
    return `${displayName} is a results-driven ${role} focused on building production-grade software with ${stack}. Over the years, ${displayName} has led and contributed to projects from initial discovery through delivery, with a strong emphasis on performance, maintainability, and measurable product outcomes.

Core strengths include translating business goals into technical architecture, owning end-to-end implementation, and driving quality through clean code practices, thoughtful testing, and reliable deployment workflows. ${displayName} is comfortable collaborating across product, design, and engineering, and is known for clear communication, practical decision-making, and consistent delivery under changing requirements.

In day-to-day work, ${displayName} prioritizes scalable system design, clear documentation, and iterative improvement. Whether improving developer experience, optimizing runtime performance, or shipping user-facing features, ${displayName} approaches each problem with accountability and long-term thinking.

Current interests include deepening expertise in platform reliability, improving observability, and building systems that balance speed of execution with strong engineering fundamentals.`;
  }, [form.name, form.primary_role, techStack, developer?.github_username]);

  const filteredTechSuggestions = useMemo(() => {
    const normalizedQuery = techQuery.trim().toLowerCase();
    return COMMON_TECH_STACK.filter((tech) => {
      const notSelected = !techStack.includes(tech);
      const matches = !normalizedQuery || tech.toLowerCase().includes(normalizedQuery);
      return notSelected && matches;
    }).slice(0, 8);
  }, [techQuery, techStack]);

  const allowedLanguageSet = useMemo(() => {
    const set = new Set<string>();
    techStack.forEach((tech) => {
      (TECH_TO_LANGUAGES[tech] || []).forEach((language) => set.add(language));
    });
    return set;
  }, [techStack]);

  const languageWarnings = selectedLanguages.filter((language) => !allowedLanguageSet.has(language));

  const addTech = (tech: string) => {
    if (!techStack.includes(tech)) {
      setTechStack((prev) => [...prev, tech]);
    }
    setTechQuery('');
  };

  const removeTech = (tech: string) => {
    setTechStack((prev) => prev.filter((item) => item !== tech));
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((item) => item !== language) : [...prev, language]
    );
  };

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
          primary_stack: Array.from(new Set([...techStack, ...selectedLanguages])),
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
                value={techQuery}
                onChange={(e) => setTechQuery(e.target.value)}
                placeholder="Type to search and add technologies"
              />
              {filteredTechSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredTechSuggestions.map((tech) => (
                    <Button key={tech} type="button" size="sm" variant="outline" onClick={() => addTech(tech)}>
                      + {tech}
                    </Button>
                  ))}
                </div>
              )}

              {techStack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-caption"
                    >
                      {tech} ×
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-1 text-caption text-muted-foreground">At least one technology is required.</p>
            </div>

            <div>
              <Label className="mb-2 block">Languages (selectable)</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((language) => {
                  const selected = selectedLanguages.includes(language);
                  const allowed = allowedLanguageSet.has(language);
                  return (
                    <button
                      key={language}
                      type="button"
                      onClick={() => toggleLanguage(language)}
                      className={`rounded-full border px-3 py-1 text-caption ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background'} ${selected && !allowed ? 'border-yellow-500 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' : ''}`}
                    >
                      {language}
                    </button>
                  );
                })}
              </div>
              {languageWarnings.length > 0 && (
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  Warning: {languageWarnings.join(', ')} is outside your current selected tech stack. Update stack or remove the language.
                </p>
              )}
              <p className="mt-1 text-caption text-muted-foreground">
                Languages highlighted in yellow are not mapped to your selected stack.
              </p>
            </div>

            <div>
              <Label htmlFor="bio" className="mb-2 block">Bio</Label>
              <div className="mb-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setForm((prev) => ({ ...prev, bio: longBioTemplate }))}>
                  Use Long Bio Template
                </Button>
              </div>
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
