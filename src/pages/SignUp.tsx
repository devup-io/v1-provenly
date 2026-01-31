import { motion } from "framer-motion";
import { Github, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const handleGitHubSignUp = () => {
    navigate("/oauth-loading");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="text-heading font-bold tracking-tight">Provenly</span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-display-sm">
              Create your Provenly developer profile
            </h1>
            <p className="text-body text-muted-foreground">
              Let companies evaluate your real work, not just your CV.
            </p>
          </div>

          {/* GitHub Sign Up Button */}
          <Button
            onClick={handleGitHubSignUp}
            size="xl"
            className="w-full gap-3"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </Button>

          {/* Helper text */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <p className="text-body-sm text-muted-foreground">
              We only access public profile and repositories. No emails. No passwords.
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-caption text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Secondary Link */}
          <Button
            variant="outline"
            onClick={() => navigate("/developers")}
            className="w-full gap-2"
          >
            <Eye className="h-4 w-4" />
            View example profiles
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
