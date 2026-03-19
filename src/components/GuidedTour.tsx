import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DeveloperProfile } from '@/types/api';
import { getDeveloper } from '@/lib/api';

const TOUR_COMPLETED_KEY = 'v1_intro_completed';
const TOUR_AUTO_START_KEY = 'v1_intro_auto_start';
const TOUR_REQUESTED_KEY = 'v1_intro_requested';
const START_TOUR_EVENT = 'provenly:start-tour';

type TourStep = {
  title: string;
  description: string;
  route: string;
  selector?: string;
};

const NEW_USER_TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Provenly 👋',
    description: 'We help you turn your projects into structured proof of skill.',
    route: '/welcome',
    selector: '[data-tour="welcome-card"]',
  },
  {
    title: 'Step 2: Select your role',
    description: 'Choose your primary developer role so we evaluate your work correctly.',
    route: '/profile-setup?step=1',
    selector: '[data-tour="role-step"]',
  },
  {
    title: 'Step 3: Submit repositories',
    description: 'Select the projects you want Provenly to analyze.',
    route: '/profile-setup?step=2',
    selector: '[data-tour="repo-import-step"]',
  },
  {
    title: 'Step 4: AI evaluation',
    description: 'We analyze your projects for complexity, contribution, and credibility.',
    route: '/dashboard',
    selector: '[data-tour="run-analysis-btn"]',
  },
  {
    title: 'Step 5: Your profile',
    description: 'Your Provenly profile shows clear proof founders can understand instantly.',
    route: '/dashboard',
    selector: '[data-tour="profile-overview"]',
  },
  {
    title: 'You’re all set 🚀',
    description: 'Start building your proof.',
    route: '/dashboard',
    selector: '[data-tour="actions-card"]',
  },
];

const EXISTING_USER_TOUR_STEPS: TourStep[] = [
  {
    title: 'Step 1: Submit repositories',
    description: 'Use this action to import more repositories into your profile.',
    route: '/dashboard',
    selector: '[data-tour="add-repo-btn"]',
  },
  {
    title: 'Step 2: AI evaluation',
    description: 'Run analysis to update complexity, contribution, and credibility signals.',
    route: '/dashboard',
    selector: '[data-tour="run-analysis-btn"]',
  },
  {
    title: 'Step 3: Your profile',
    description: 'This section summarizes what founders can quickly verify about your skills.',
    route: '/dashboard',
    selector: '[data-tour="profile-overview"]',
  },
  {
    title: 'You’re all set 🚀',
    description: 'Keep improving your proof by importing relevant projects and rerunning analysis.',
    route: '/dashboard',
    selector: '[data-tour="actions-card"]',
  },
];

function parseRoute(input: string): { pathname: string; search: string } {
  const [pathname, searchRaw] = input.split('?');
  return {
    pathname,
    search: searchRaw ? `?${searchRaw}` : '',
  };
}

function markTourCompleted() {
  try {
    localStorage.setItem(TOUR_COMPLETED_KEY, '1');
    localStorage.removeItem(TOUR_AUTO_START_KEY);
    localStorage.removeItem(TOUR_REQUESTED_KEY);
  } catch {
    // ignore storage errors
  }
}

function clearTourTriggers() {
  try {
    localStorage.removeItem(TOUR_AUTO_START_KEY);
    localStorage.removeItem(TOUR_REQUESTED_KEY);
  } catch {
    // ignore storage errors
  }
}

export function GuidedTour() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);

  const tourSteps = developer?.profile_complete ? EXISTING_USER_TOUR_STEPS : NEW_USER_TOUR_STEPS;
  const safeStepIndex = Math.min(stepIndex, Math.max(0, tourSteps.length - 1));
  const step = tourSteps[safeStepIndex];
  const expectedRoute = parseRoute(step.route);
  const routeMatches =
    location.pathname === expectedRoute.pathname &&
    (expectedRoute.search ? location.search === expectedRoute.search : true);

  const startTour = () => {
    setDeveloper(getDeveloper());
    setStepIndex(0);
    setOpen(true);
    clearTourTriggers();
  };

  const stopTour = (completed: boolean) => {
    setOpen(false);
    setTarget(null);
    if (completed) {
      markTourCompleted();
      return;
    }

    try {
      localStorage.removeItem(TOUR_AUTO_START_KEY);
      localStorage.removeItem(TOUR_REQUESTED_KEY);
      localStorage.setItem(TOUR_COMPLETED_KEY, '1');
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const onStartTour = () => {
      startTour();
    };

    window.addEventListener(START_TOUR_EVENT, onStartTour);

    const dev = getDeveloper();
    setDeveloper(dev);
    if (!dev) {
      return () => {
        window.removeEventListener(START_TOUR_EVENT, onStartTour);
      };
    }

    let shouldAutoStart = false;
    try {
      const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === '1';
      const autoStart = localStorage.getItem(TOUR_AUTO_START_KEY) === '1';
      const requested = localStorage.getItem(TOUR_REQUESTED_KEY) === '1';
      shouldAutoStart = (autoStart || requested) && !completed;
    } catch {
      shouldAutoStart = false;
    }

    if (shouldAutoStart) {
      startTour();
    }

    return () => {
      window.removeEventListener(START_TOUR_EVENT, onStartTour);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (safeStepIndex !== stepIndex) {
      setStepIndex(safeStepIndex);
    }
  }, [open, safeStepIndex, stepIndex]);

  useEffect(() => {
    if (!open) return;

    if (!routeMatches) {
      navigate(step.route);
      return;
    }

    if (!step.selector) {
      setTarget(null);
      return;
    }

    let retries = 0;
    let cancelled = false;

    const resolveTarget = () => {
      if (cancelled) return;
      const found = document.querySelector(step.selector || '') as HTMLElement | null;
      if (!found) {
        retries += 1;
        if (retries < 8) {
          window.setTimeout(resolveTarget, 200);
        } else {
          setTarget(null);
        }
        return;
      }

      found.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTarget(found);
    };

    resolveTarget();

    return () => {
      cancelled = true;
    };
  }, [open, routeMatches, step.route, step.selector, navigate]);

  useEffect(() => {
    if (!target) return;
    target.classList.add('provenly-tour-target', 'provenly-tour-target-active');
    return () => {
      target.classList.remove('provenly-tour-target', 'provenly-tour-target-active');
    };
  }, [target]);

  if (!open) return null;

  const isLastStep = safeStepIndex === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[1200]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="fixed bottom-4 left-1/2 z-[1300] w-[92vw] max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-2xl">
        <p className="text-caption text-muted-foreground">
          Step {safeStepIndex + 1} of {tourSteps.length}
        </p>
        <h3 className="mt-1 text-body font-semibold">{step.title}</h3>
        <p className="mt-2 text-body-sm text-muted-foreground">{step.description}</p>

        <Progress className="mt-3 h-1.5" value={Math.round(((safeStepIndex + 1) / tourSteps.length) * 100)} />

        {!routeMatches && (
          <p className="mt-2 text-caption text-muted-foreground">
            Navigating to the next section…
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => stopTour(false)}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safeStepIndex === 0}
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isLastStep) {
                  stopTour(true);
                  return;
                }
                setStepIndex((prev) => Math.min(tourSteps.length - 1, prev + 1));
              }}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
