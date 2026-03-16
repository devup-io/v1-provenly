import { motion } from "framer-motion";
import { Github, User, FolderGit2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDeveloper } from "@/lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<{ github_username?: string; name?: string; github_avatar?: string; profile_complete?: boolean } | null>(null);

  useEffect(() => {
    try {
      const dev = getDeveloper();
      if (dev) {
        // If user already has a completed profile, redirect to dashboard
        if (dev.profile_complete) {
          navigate('/dashboard');
          return;
        }
        setDeveloper(dev);
      }
    } catch (e) {
      // ignore
    }
  }, [navigate]);

  const steps = [
    { icon: User, label: "Choose your role", completed: false },
    { icon: FolderGit2, label: "Select GitHub projects", completed: false },
    { icon: FileText, label: "Add project context", completed: false },
  ];

  if (!developer) {
    // If there's no signed-in developer, show a clear sign-in CTA instead of placeholder/mocked identity
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card text-center">
            <div className="mb-6 mx-auto h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Github className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mb-3 text-heading-sm">Welcome to Provenly</h1>
            <p className="mb-6 text-body text-muted-foreground">Sign in with GitHub to build your verified developer profile.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/signup')} size="lg">Sign in with GitHub</Button>
              <Button variant="outline" onClick={() => navigate('/developers')} size="lg">Browse developers</Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const username = developer.github_username || developer.username || developer.name || "";
  const avatarUrl = developer.github_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          {/* Header with Avatar */}
          <div className="mb-8 flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <img
                src={avatarUrl}
                alt={developer?.name || username}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Github className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-heading-sm">
                Welcome to Provenly, {username} 👋
              </h1>
              <p className="text-body-sm text-muted-foreground">GitHub verified</p>
            </div>
          </div>

          {/* Explanation Card */}
          <div className="mb-8 rounded-xl bg-pastel-lavender/50 p-5">
            <p className="text-body text-pastel-lavender-foreground">
              Your profile is built around your real projects. Let's set it up in a few quick steps.
            </p>
          </div>

          {/* Step Preview */}
          <div className="mb-8 space-y-4">
            <p className="text-body-sm font-medium text-muted-foreground uppercase tracking-wider">What's next</p>
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <step.icon className="h-5 w-5 text-secondary-foreground" />
                </div>
                <span className="flex-1 text-body font-medium">{step.label}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-caption font-semibold text-muted-foreground">
                  {index + 1}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <Button onClick={() => navigate("/profile-setup")} size="xl" className="w-full">
            Start profile setup
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
