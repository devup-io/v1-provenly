import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getDeveloper, updateDeveloperProfile, importAllProjects, getSupportedDevTypes } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import type { DeveloperProfile } from '@/types/api';

const TECH_STACK_OPTIONS = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'Go',
  'Rust',
  'TypeScript',
  'JavaScript',
  'PHP',
  'Ruby',
  'Kotlin',
  'Swift',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Kubernetes',
];

// map primary roles to more relevant technology lists
const ROLE_TECH_MAP: Record<string, string[]> = {
  'Frontend Developer': [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
  ],
  'Backend Developer': [
    'Node.js', 'Python', 'Java', 'Go', 'Rust', 'Ruby', 'PHP', 'SQL', 'Docker',
  ],
  'Full-stack Developer': TECH_STACK_OPTIONS,
  'Mobile Developer': ['React Native', 'Swift', 'Kotlin', 'Java', 'Dart'],
  'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
  'Data Engineer': ['Python', 'SQL', 'Scala', 'Spark', 'AWS'],
  'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'R'],
  'Product Manager': [],
  'Design Engineer': [],
};

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Engineer',
  'Machine Learning Engineer',
  'Product Manager',
  'Design Engineer',
];

export default function Onboarding() {
  const BIO_MIN = 200;
  const BIO_MAX = 1000;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedStep = Number(searchParams.get('step'));
  const initialStep = Number.isFinite(requestedStep)
    ? Math.min(Math.max(requestedStep, 1), 3)
    : 1;
  const developer = getDeveloper();
  const { settings } = useSettings();
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: developer?.name || '',
    primary_role: developer?.primary_role || '',
    primary_stack: developer?.primary_stack || [],
    bio: developer?.bio || '',
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    developer?.primary_role ? [developer.primary_role] : []
  );
  const [supportedRoles, setSupportedRoles] = useState<string[]>([]);

  useEffect(() => {
    getSupportedDevTypes().then((list) => {
      setSupportedRoles(list);
    }).catch(() => undefined);
  }, []);

  if (!developer) {
    navigate('/signup');
    return null;
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!profileData.name.trim()) {
        setFormError('Please enter your name.');
        return;
      }

      if (selectedRoles.length === 0) {
        setFormError('Please select at least one role.');
        return;
      }

      if (supportedRoles.length > 0) {
        const unsupported = selectedRoles.filter((role) => !supportedRoles.includes(role));
        if (unsupported.length > 0) {
          setFormError(`Unsupported role(s): ${unsupported.join(', ')}`);
          return;
        }
      }

      setProfileData((prev) => ({
        ...prev,
        primary_role: selectedRoles[0] || prev.primary_role,
      }));

      setFormError(null);
      setStep(2);
    } else if (step === 2) {
      if (!profileData.primary_role) {
        setFormError('Please select a primary role.');
        return;
      }
      if (supportedRoles.length > 0 && !supportedRoles.includes(profileData.primary_role)) {
        setFormError(`Role '${profileData.primary_role}' is not currently supported.`);
        return;
      }
      if (profileData.primary_stack.length === 0) {
        setFormError('Please select at least one technology.');
        return;
      }
      setFormError(null);
      setStep(3);
    } else if (step === 3) {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      const bioLength = profileData.bio.trim().length;
      if (bioLength < BIO_MIN || bioLength > BIO_MAX) {
        setFormError(`Bio must be between ${BIO_MIN} and ${BIO_MAX} characters.`);
        return;
      }

      setLoading(true);
      setFormError(null);

      // Update developer profile (include current settings)
      await updateDeveloperProfile(developer.id, profileData, settings);

      // Trigger repository import (use any names we stored earlier if present)
      const state = localStorage.getItem('v1_oauth_state');
      if (state) {
        try {
          const saved = localStorage.getItem('v1_selected_repo_names');
          const names = saved ? JSON.parse(saved) as string[] : undefined;
          await importAllProjects(state, names);
        } catch {
          setFormError('Profile saved, but repository import could not start. You can import repositories from the dashboard.');
        }
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTech = (tech: string) => {
    setProfileData((prev) => ({
      ...prev,
      primary_stack: prev.primary_stack.includes(tech)
        ? prev.primary_stack.filter((t) => t !== tech)
        : [...prev.primary_stack, tech],
    }));
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role];
      setProfileData((current) => ({
        ...current,
        primary_role: next[0] || '',
      }));
      return next;
    });
  };

  const techOptions = selectedRoles.length > 0
    ? Array.from(
        new Set(
          selectedRoles.flatMap((role) => ROLE_TECH_MAP[role] || TECH_STACK_OPTIONS)
        )
      )
    : TECH_STACK_OPTIONS;

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display-sm">Welcome, {developer.name || developer.github_username}!</h1>
          <p className="text-body text-muted-foreground">Let's complete your developer profile</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
          <p className="mt-2 text-caption text-muted-foreground text-center">
            Step {step} of 3
          </p>
        </div>

        {/* Step 1: Name & Role */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
          >
            <h2 className="mb-6 text-heading-md">Basic Information</h2>

            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="mb-2 block text-body-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="bg-background"
                />
              </div>

              <div>
                <Label className="mb-3 block text-body-sm font-medium">
                  Role(s)
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(supportedRoles.length > 0 ? supportedRoles : ROLE_OPTIONS).map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`rounded-lg border-2 px-4 py-3 text-left text-body-sm font-medium transition ${
                        selectedRoles.includes(role)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-caption text-muted-foreground">
                  You can select multiple roles. The first selected role is used as your primary role.
                </p>
                {supportedRoles.length > 0 && (
                  <p className="mt-2 text-caption text-muted-foreground">
                    Supported: {supportedRoles.join(', ')}. Provenly currently evaluates the following project domains: Backend, Frontend, Full-stack, Mobile, DevOps, AI/ML, Blockchain, Data, Security; repos outside these domains will be marked “Unsupported”.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} disabled>
                Back
              </Button>
              <Button onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Tech Stack */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
          >
            <h2 className="mb-6 text-heading-md">Primary Tech Stack</h2>

            <div className="mb-6">
              <p className="mb-3 text-body-sm text-muted-foreground">
                Select the technologies you're most proficient with (select at least 1)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {techOptions.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`rounded-lg border-2 px-3 py-2 text-center text-caption font-medium transition ${
                      profileData.primary_stack.includes(tech)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    {profileData.primary_stack.includes(tech) && (
                      <CheckCircle2 className="mb-1 h-3 w-3 mx-auto" />
                    )}
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={loading || profileData.primary_stack.length === 0}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Bio */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
          >
            <h2 className="mb-6 text-heading-md">Tell Us About Yourself</h2>

            <div className="space-y-5">
              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div>
                <Label htmlFor="bio" className="mb-2 block text-body-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us what makes you a great developer..."
                  rows={4}
                  className="bg-background resize-none"
                />
                <p className={`mt-1 text-caption ${profileData.bio.trim().length < BIO_MIN || profileData.bio.trim().length > BIO_MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {profileData.bio.trim().length}/{BIO_MAX} characters (required: {BIO_MIN}–{BIO_MAX})
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-body-sm text-muted-foreground">
                  <strong>Next:</strong> We'll import your GitHub repositories and analyze them with AI
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={
                  loading ||
                  profileData.bio.trim().length < BIO_MIN ||
                  profileData.bio.trim().length > BIO_MAX
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Skip Option */}
        {step < 3 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => handleComplete()}
              disabled={loading}
              className="text-body-sm text-muted-foreground hover:text-foreground transition underline"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
