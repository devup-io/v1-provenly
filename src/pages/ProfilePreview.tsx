import { motion } from "framer-motion";
import { Github, Star, GitBranch, Edit2, Globe, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const mockProfile = {
  name: "Alex Rivera",
  username: "alexrivera",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  roles: ["Full-stack Engineer", "AI / ML Engineer"],
  yearsOfExperience: 5,
  techStack: ["React", "TypeScript", "Python", "PostgreSQL", "AWS", "Docker"],
  projects: [
    {
      name: "real-time-collaboration-engine",
      stars: 234,
      forks: 89,
      complexity: "L3",
      problem:
        "Teams needed a way to collaborate in real-time without conflicts when editing shared documents.",
      contribution:
        "Built the core CRDT engine for conflict resolution and the WebSocket infrastructure supporting 10k concurrent users.",
      techUsed: ["TypeScript", "WebSocket", "Redis", "CRDT"],
    },
    {
      name: "ml-image-classifier",
      stars: 156,
      forks: 42,
      complexity: "L2",
      problem: "Automating image categorization for e-commerce platforms.",
      contribution:
        "Designed and trained the CNN model, achieving 94% accuracy on product images.",
      techUsed: ["Python", "PyTorch", "FastAPI", "Docker"],
    },
  ],
};

const complexityColors: Record<string, string> = {
  L1: "bg-pastel-mint text-pastel-mint-foreground",
  L2: "bg-pastel-yellow text-pastel-yellow-foreground",
  L3: "bg-pastel-peach text-pastel-peach-foreground",
};

const complexityLabels: Record<string, string> = {
  L1: "Simple",
  L2: "Intermediate",
  L3: "Complex",
};

export default function ProfilePreview() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-heading">Profile Preview</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            {!isPublished ? (
              <Button onClick={handlePublish} className="gap-2" disabled={isPublishing}>
                {isPublishing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Publish my profile
                  </>
                )}
              </Button>
            ) : (
              <Button variant="mint" className="gap-2" asChild>
                <a href="/developers" target="_blank">
                  <CheckCircle2 className="h-4 w-4" />
                  View live profile
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Published Banner */}
        {isPublished && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between rounded-xl bg-pastel-mint p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-pastel-mint-foreground" />
              <span className="font-medium text-pastel-mint-foreground">
                Your profile is now live!
              </span>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-body-sm font-medium text-pastel-mint-foreground underline"
            >
              provenly.live/dev/{mockProfile.username}
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border bg-card shadow-card"
        >
          {/* Header Section */}
          <div className="border-b border-border p-8">
            <div className="flex items-start gap-6">
              <img
                src={mockProfile.avatarUrl}
                alt={mockProfile.name}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-display-sm">{mockProfile.name}</h2>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1">
                    <Github className="h-4 w-4 text-primary-foreground" />
                    <span className="text-caption font-medium text-primary-foreground">
                      Verified
                    </span>
                  </div>
                </div>
                <p className="mb-4 text-body text-muted-foreground">
                  {mockProfile.roles.join(" · ")} · {mockProfile.yearsOfExperience}+ years
                </p>
                <div className="flex flex-wrap gap-2">
                  {mockProfile.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-secondary px-3 py-1.5 text-body-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="p-8">
            <h3 className="mb-6 text-heading-sm">Featured Projects</h3>
            <div className="space-y-6">
              {mockProfile.projects.map((project) => (
                <div
                  key={project.name}
                  className="rounded-xl border border-border bg-muted/20 p-6"
                >
                  {/* Project Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold">{project.name}</h4>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-caption font-bold ${
                            complexityColors[project.complexity]
                          }`}
                        >
                          {project.complexity} – {complexityLabels[project.complexity]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-caption text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          {project.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3.5 w-3.5" />
                          {project.forks}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Github className="h-4 w-4" />
                      View repo
                    </Button>
                  </div>

                  {/* Problem & Contribution */}
                  <div className="mb-4 space-y-3">
                    <div>
                      <p className="mb-1 text-caption font-medium uppercase tracking-wider text-muted-foreground">
                        Problem Solved
                      </p>
                      <p className="text-body-sm">{project.problem}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-caption font-medium uppercase tracking-wider text-muted-foreground">
                        My Contribution
                      </p>
                      <p className="text-body-sm">{project.contribution}</p>
                    </div>
                  </div>

                  {/* Tech Used */}
                  <div className="flex flex-wrap gap-2">
                    {project.techUsed.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-secondary px-2.5 py-1 text-caption"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
