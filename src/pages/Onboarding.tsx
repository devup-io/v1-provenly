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
  const [profileData, setProfileData] = useState({
    name: developer?.name || '',
    primary_role: developer?.primary_role || '',
    primary_stack: developer?.primary_stack || [],
    bio: developer?.bio || '',
  });
  const [supportedRoles, setSupportedRoles] = useState<string[]>([]);

  useEffect(() => {
    getSupportedDevTypes().then((list) => {
      setSupportedRoles(list);
    }).catch(console.warn);
  }, []);

  if (!developer) {
    navigate('/signup');
    return null;
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!profileData.name.trim()) {
        alert('Please enter your name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!profileData.primary_role) {
        alert('Please select a primary role');
        return;
      }
      if (supportedRoles.length > 0 && !supportedRoles.includes(profileData.primary_role)) {
        alert(`Role '${profileData.primary_role}' is not currently supported`);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Update developer profile (include current settings)
      await updateDeveloperProfile(developer.id, profileData, settings);

      // Trigger repository import (use any names we stored earlier if present)
      const state = localStorage.getItem('v1_oauth_state');
      if (state) {
        try {
          const saved = localStorage.getItem('v1_selected_repo_names');
          const names = saved ? JSON.parse(saved) as string[] : undefined;
          await importAllProjects(state, names);
        } catch (err) {
          console.warn('Failed to trigger import-all:', err);
        }
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      alert(err instanceof Error ? err.message : 'Failed to complete onboarding');
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
                  Primary Role
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(supportedRoles.length > 0 ? supportedRoles : ROLE_OPTIONS).map((role) => (
                    <button
                      key={role}
                      onClick={() =>
                        setProfileData({ ...profileData, primary_role: role })
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-left text-body-sm font-medium transition ${
                        profileData.primary_role === role
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
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
                {(ROLE_TECH_MAP[profileData.primary_role] || TECH_STACK_OPTIONS).map((tech) => (
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
              <div>
                <Label htmlFor="bio" className="mb-2 block text-body-sm font-medium">
                  Bio (Optional)
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
                <p className="mt-1 text-caption text-muted-foreground">
                  {profileData.bio.length}/500 characters
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
              <Button onClick={handleComplete} disabled={loading}>
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
