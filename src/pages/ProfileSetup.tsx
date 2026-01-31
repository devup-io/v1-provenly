import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StepRoleBasics } from "@/components/onboarding/StepRoleBasics";
import { StepGitHubProjects } from "@/components/onboarding/StepGitHubProjects";
import { StepProjectBreakdown } from "@/components/onboarding/StepProjectBreakdown";
import { Progress } from "@/components/ui/progress";

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
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-body-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-body-sm font-medium text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
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
