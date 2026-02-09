import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Github, Code2, Star, GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Floating developer card component
function DeveloperCard({
  name,
  role,
  avatar,
  level,
  techStack,
  delay = 0,
  className = "",
}: {
  name: string;
  role: string;
  avatar: string;
  level: string;
  techStack: string[];
  delay?: number;
  className?: string;
}) {
  const levelColors = {
    "L1": "bg-pastel-mint text-pastel-mint-foreground",
    "L2": "bg-pastel-yellow text-pastel-yellow-foreground",
    "L3": "bg-pastel-peach text-pastel-peach-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`rounded-2xl border border-border bg-card p-4 shadow-card ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-pastel-lavender">
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-sm">
            <Github className="h-3 w-3 text-foreground" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-semibold">{name}</p>
          <p className="truncate text-caption text-muted-foreground">{role}</p>
        </div>
        <div className={`rounded-lg px-2 py-1 ${levelColors[level as keyof typeof levelColors]}`}>
          <span className="text-caption font-bold">{level}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// Badge component for floating elements
function FloatingBadge({
  icon: Icon,
  text,
  color,
  delay = 0,
  className = "",
}: {
  icon: React.ElementType;
  text: string;
  color: "peach" | "lavender" | "mint" | "yellow" | "blue";
  delay?: number;
  className?: string;
}) {
  const colorClasses = {
    peach: "bg-pastel-peach text-pastel-peach-foreground",
    lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
    mint: "bg-pastel-mint text-pastel-mint-foreground",
    yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
    blue: "bg-pastel-blue text-pastel-blue-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-md ${colorClasses[color]} ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-body-sm font-medium">{text}</span>
    </motion.div>
  );
}

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-28 md:pb-32 md:pt-36">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-pastel-peach/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pastel-lavender/30 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content - centered on mobile/tablet when right section hidden */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-pastel-mint/50 px-4 py-2"
            >
              <Github className="h-4 w-4 text-pastel-mint-foreground" />
              <span className="text-body-sm font-medium text-pastel-mint-foreground">
                GitHub-verified profiles only
              </span>
            </motion.div>

            <h1 className="mb-6 text-display text-balance md:text-display-lg lg:text-display-xl">
              Provenly helps companies evaluate developers{" "}
              <span className="text-muted-foreground">by real work, not CVs.</span>
            </h1>

            <p className="mb-8 text-body-lg text-muted-foreground">
              No fake profiles. No empty resumes. Browse developers verified through their 
              actual GitHub contributions, with real project breakdowns and complexity levels.
            </p>

            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>
                <Github className="mr-2 h-5 w-5" />
                Create Developer Profile
              </Button>
              <Button variant="hero-outline" size="xl" onClick={() => navigate("/developers")}>
                View Sample Developers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-body-sm text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-pastel-mint-foreground" />
                <span>Real code reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-pastel-yellow-foreground" />
                <span>Complexity rated</span>
              </div>
            </div>
          </motion.div>

          {/* Right visual - Floating cards */}
          <div className="relative hidden h-[500px] lg:block">
            {/* Main developer card */}
            <DeveloperCard
              name="Adeola Babatunde"
              role="Full-Stack Engineer"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              level="L3"
              techStack={["React", "Node.js", "PostgreSQL"]}
              delay={0.3}
              className="animate-float absolute left-4 top-16 w-72"
            />

            {/* Secondary developer card */}
            <DeveloperCard
              name="Tunde Ogunwale"
              role="Backend Engineer"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
              level="L2"
              techStack={["Python", "FastAPI", "Redis"]}
              delay={0.5}
              className="animate-float-delayed absolute bottom-20 right-0 w-72"
            />

            {/* Floating badges */}
            <FloatingBadge
              icon={Github}
              text="GitHub Verified"
              color="mint"
              delay={0.7}
              className="absolute right-16 top-8 animate-float"
            />

            <FloatingBadge
              icon={GitBranch}
              text="847 commits"
              color="lavender"
              delay={0.9}
              className="animate-float-delayed absolute bottom-8 left-0"
            />

            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/50 bg-card/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
