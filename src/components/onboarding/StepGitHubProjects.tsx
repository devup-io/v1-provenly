import { motion } from "framer-motion";
import { Star, GitBranch, Calendar, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/pages/ProfileSetup";

const mockRepositories = [
  {
    id: "1",
    name: "real-time-collaboration-engine",
    language: "TypeScript",
    stars: 234,
    forks: 89,
    lastUpdated: "2 days ago",
    description: "A distributed real-time collaboration engine with CRDT support",
  },
  {
    id: "2",
    name: "ml-image-classifier",
    language: "Python",
    stars: 156,
    forks: 42,
    lastUpdated: "1 week ago",
    description: "Deep learning image classifier using PyTorch",
  },
  {
    id: "3",
    name: "nextjs-saas-starter",
    language: "TypeScript",
    stars: 89,
    forks: 23,
    lastUpdated: "3 days ago",
    description: "Production-ready SaaS starter with auth, billing, and more",
  },
  {
    id: "4",
    name: "rust-cli-toolkit",
    language: "Rust",
    stars: 67,
    forks: 12,
    lastUpdated: "2 weeks ago",
    description: "High-performance CLI tools for developer productivity",
  },
  {
    id: "5",
    name: "graphql-api-gateway",
    language: "Go",
    stars: 123,
    forks: 34,
    lastUpdated: "5 days ago",
    description: "API gateway with GraphQL federation support",
  },
  {
    id: "6",
    name: "react-component-library",
    language: "TypeScript",
    stars: 45,
    forks: 8,
    lastUpdated: "1 month ago",
    description: "Accessible React components with Radix primitives",
  },
];

const languageColors: Record<string, string> = {
  TypeScript: "bg-pastel-blue",
  Python: "bg-pastel-yellow",
  Rust: "bg-pastel-peach",
  Go: "bg-pastel-mint",
  JavaScript: "bg-pastel-yellow",
};

type Props = {
  data: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepGitHubProjects({ data, onUpdate, onNext, onBack }: Props) {
  const toggleProject = (projectId: string) => {
    const newSelected = data.selectedProjects.includes(projectId)
      ? data.selectedProjects.filter((id) => id !== projectId)
      : data.selectedProjects.length < 5
      ? [...data.selectedProjects, projectId]
      : data.selectedProjects;
    onUpdate({ selectedProjects: newSelected });
  };

  const canContinue = data.selectedProjects.length >= 2;

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
      <div className="mb-8">
        <h2 className="mb-2 text-display-sm">Select your best projects</h2>
        <p className="text-body text-muted-foreground">
          Choose 2–5 projects that best represent your skills. These will be showcased on your profile.
        </p>
      </div>

      {/* Selection Counter */}
      <div className="mb-6 rounded-xl bg-muted/50 p-4">
        <p className="text-body-sm">
          <span className="font-semibold text-primary">{data.selectedProjects.length}</span> of{" "}
          <span className="font-semibold">5</span> projects selected
          {data.selectedProjects.length < 2 && (
            <span className="ml-2 text-muted-foreground">(minimum 2 required)</span>
          )}
        </p>
      </div>

      {/* Project Grid */}
      <div className="mb-8 space-y-3">
        {mockRepositories.map((repo, index) => {
          const isSelected = data.selectedProjects.includes(repo.id);
          return (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleProject(repo.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate font-semibold">{repo.name}</h3>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-caption font-medium ${
                        languageColors[repo.language] || "bg-secondary"
                      }`}
                    >
                      {repo.language}
                    </span>
                  </div>
                  <p className="mb-3 truncate text-body-sm text-muted-foreground">
                    {repo.description}
                  </p>
                  <div className="flex items-center gap-4 text-caption text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      {repo.forks}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {repo.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="flex-1" disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
