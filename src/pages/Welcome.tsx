import { motion } from "framer-motion";
import { Github, User, FolderGit2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const mockUser = {
  username: "alexrivera",
  name: "Alex Rivera",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
};

export default function Welcome() {
  const navigate = useNavigate();

  const steps = [
    { icon: User, label: "Choose your role", completed: false },
    { icon: FolderGit2, label: "Select GitHub projects", completed: false },
    { icon: FileText, label: "Add project context", completed: false },
  ];

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
                src={mockUser.avatarUrl}
                alt={mockUser.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Github className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-heading-sm">
                Welcome to Provenly, {mockUser.username} 👋
              </h1>
              <p className="text-body-sm text-muted-foreground">
                GitHub verified
              </p>
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
            <p className="text-body-sm font-medium text-muted-foreground uppercase tracking-wider">
              What's next
            </p>
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
          <Button
            onClick={() => navigate("/profile-setup")}
            size="xl"
            className="w-full"
          >
            Start profile setup
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
