import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export default function OAuthLoading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Connecting to GitHub...",
    "Verifying your account...",
    "Fetching repositories...",
    "Almost there...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    const navigateTimeout = setTimeout(() => {
      navigate("/welcome");
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(navigateTimeout);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          {/* GitHub Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary"
          >
            <Github className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          {/* Status Text */}
          <h2 className="mb-2 text-heading-sm">Verifying your GitHub account</h2>
          <p className="mb-8 text-body text-muted-foreground">
            This helps keep Provenly profiles real and trustworthy.
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((stepText, index) => (
              <motion.div
                key={stepText}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: index <= step ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: index * 0.15, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                {index < step ? (
                  <CheckCircle2 className="h-5 w-5 text-pastel-mint-foreground" />
                ) : index === step ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-border" />
                )}
                <span
                  className={`text-body-sm ${
                    index <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {stepText}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
