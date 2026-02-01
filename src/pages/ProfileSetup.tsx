import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StepRoleBasics } from "@/components/onboarding/StepRoleBasics";
import { StepGitHubProjects } from "@/components/onboarding/StepGitHubProjects";
import { StepProjectBreakdown } from "@/components/onboarding/StepProjectBreakdown";

export type ProfileData = {
  roles: string[];
  yearsOfExperience: number;
  techStack: string[];
  selectedProjects: string[];
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
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    roles: [],
    yearsOfExperience: 3,
    techStack: [],
    selectedProjects: [],
    projectBreakdowns: {},
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate("/profile-preview");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-2xl">
        {/* Progress Header */}
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
              />
            )}
            {currentStep === 3 && (
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
