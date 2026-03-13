import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StepRoleBasics } from "@/components/onboarding/StepRoleBasics";
import { StepGitHubProjects } from "@/components/onboarding/StepGitHubProjects";
import { StepProjectBreakdown } from "@/components/onboarding/StepProjectBreakdown";
import { importAllProjects, getDeveloper } from "@/lib/api";
import type { Repo } from "@/types/api";

export type ProfileData = {
  roles: string[];
  yearsOfExperience: number;
  techStack: string[];
  selectedProjects: string[];
  repos: Repo[];
  projectBreakdowns: Record<
    string,
    {
      problem: string;
      contribution: string;
      complexity: "L1" | "L2" | "L3";
      techUsed: string[];
      challenges: string;
    }
  >;
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedStep = Number(searchParams.get("step"));
  const initialStep = Number.isFinite(requestedStep)
    ? Math.min(Math.max(requestedStep, 1), 3)
    : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [profileData, setProfileData] = useState<ProfileData>({
    roles: [],
    yearsOfExperience: 3,
    techStack: [],
    selectedProjects: [],
    repos: [],
    projectBreakdowns: {},
  });

  // Redirect existing users unless they're importing more repos
  useEffect(() => {
    try {
      const dev = getDeveloper();
      if (dev?.profile_complete) {
        // Allow access only if importing more repos (step=2)
        const isImportingMore = requestedStep === 2;
        if (!isImportingMore) {
          console.log('[ProfileSetup] User already has completed profile, redirecting to dashboard');
          navigate('/dashboard');
        }
      }
    } catch (e) {
      // ignore
    }
  }, [navigate, requestedStep]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    // when user is simply importing additional repos we don't need to
    // show the project breakdown step; go straight to the preview page
    if (isImportingMore && currentStep === 2) {
      navigate("/dashboard");
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // final step of the normal setup flow: compute names of repos the user
    // explicitly selected and send them to the backend so we don't import
    // every repository in their account by accident.
    const selectedRepos = profileData.repos.filter((repo) =>
      profileData.selectedProjects.includes(repo.id)
    );
    const selectedRepoNames = selectedRepos
      .map((repo) => repo.name?.trim().toLowerCase())
      .filter((name): name is string => Boolean(name));

    // keep the old localStorage fallback for backwards compatibility
    localStorage.setItem("v1_selected_repo_names", JSON.stringify(selectedRepoNames));

    const state = localStorage.getItem("v1_oauth_state");
    if (state) {
      try {
        await importAllProjects(state, selectedRepoNames);
      } catch (err) {
        console.warn("[ProfileSetup] importAllProjects failed after selection:", err);
      }
    }

    navigate("/dashboard");
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  const isImportingMore = requestedStep === 2;

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-2xl">
        {/* Progress Header - Hidden when importing more repos */}
        {!isImportingMore && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <motion.span 
                key={`step-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-body-sm font-medium text-muted-foreground"
              >
                Step {currentStep} of {totalSteps}
              </motion.span>
              <span className="text-body-sm font-medium text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: 0.3 }
            }}
          >
            {currentStep === 1 && (
              <StepRoleBasics
                data={profileData}
                onUpdate={updateProfileData}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <StepGitHubProjects
                data={profileData}
                onUpdate={updateProfileData}
                onNext={handleNext}
                onBack={handleBack}
                isImportingMore={isImportingMore}
              />
            )}
            {currentStep === 3 && !isImportingMore && (
              <StepProjectBreakdown
                data={profileData}
                onUpdate={updateProfileData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
