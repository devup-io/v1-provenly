import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { ProfileData } from "@/pages/ProfileSetup";

const mockProjectNames: Record<string, string> = {
  "1": "real-time-collaboration-engine",
  "2": "ml-image-classifier",
  "3": "nextjs-saas-starter",
  "4": "rust-cli-toolkit",
  "5": "graphql-api-gateway",
  "6": "react-component-library",
};

const complexityLevels = [
  {
    level: "L1" as const,
    label: "Level 1 – Simple",
    description: "Simple CRUD, beginner-level",
    color: "bg-pastel-mint text-pastel-mint-foreground",
  },
  {
    level: "L2" as const,
    label: "Level 2 – Intermediate",
    description: "Moderate logic, integrations",
    color: "bg-pastel-yellow text-pastel-yellow-foreground",
  },
  {
    level: "L3" as const,
    label: "Level 3 – Complex",
    description: "Advanced systems, infra, AI",
    color: "bg-pastel-peach text-pastel-peach-foreground",
  },
];

type Props = {
  data: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepProjectBreakdown({ data, onUpdate, onNext, onBack }: Props) {
  const [expandedProject, setExpandedProject] = useState<string | null>(
    data.selectedProjects[0] || null
  );
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});

  const updateBreakdown = (
    projectId: string,
    field: string,
    value: string | string[]
  ) => {
    const current = data.projectBreakdowns[projectId] || {
      problem: "",
      contribution: "",
      complexity: "L2" as const,
      techUsed: [],
      challenges: "",
    };
    onUpdate({
      projectBreakdowns: {
        ...data.projectBreakdowns,
        [projectId]: { ...current, [field]: value },
      },
    });
  };

  const addTech = (projectId: string) => {
    const input = techInputs[projectId]?.trim();
    if (input) {
      const current = data.projectBreakdowns[projectId]?.techUsed || [];
      if (!current.includes(input)) {
        updateBreakdown(projectId, "techUsed", [...current, input]);
      }
      setTechInputs((prev) => ({ ...prev, [projectId]: "" }));
    }
  };

  const removeTech = (projectId: string, tech: string) => {
    const current = data.projectBreakdowns[projectId]?.techUsed || [];
    updateBreakdown(
      projectId,
      "techUsed",
      current.filter((t) => t !== tech)
    );
  };

  const isProjectComplete = (projectId: string) => {
    const breakdown = data.projectBreakdowns[projectId];
    return breakdown?.problem && breakdown?.contribution && breakdown?.complexity;
  };

  const allProjectsComplete = data.selectedProjects.every(isProjectComplete);

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
      <div className="mb-8">
        <h2 className="mb-2 text-display-sm">Add project context</h2>
        <p className="text-body text-muted-foreground">
          For each project, explain the problem you solved and your personal contribution.
        </p>
      </div>

      {/* Project Accordions */}
      <div className="mb-8 space-y-3">
        {data.selectedProjects.map((projectId) => {
          const isExpanded = expandedProject === projectId;
          const isComplete = isProjectComplete(projectId);
          const breakdown = data.projectBreakdowns[projectId] || {
            problem: "",
            contribution: "",
            complexity: "L2" as const,
            techUsed: [],
            challenges: "",
          };

          return (
            <div
              key={projectId}
              className="overflow-hidden rounded-xl border border-border"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedProject(isExpanded ? null : projectId)}
                className="flex w-full items-center justify-between bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pastel-mint">
                      <Check className="h-4 w-4 text-pastel-mint-foreground" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className="font-semibold">
                    {mockProjectNames[projectId] || projectId}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 p-6"
                >
                  {/* Problem */}
                  <div>
                    <label className="mb-2 block text-body-sm font-medium">
                      Problem the project solves *
                    </label>
                    <Textarea
                      value={breakdown.problem}
                      onChange={(e) =>
                        updateBreakdown(projectId, "problem", e.target.value)
                      }
                      placeholder="What problem does this project address?"
                      rows={3}
                    />
                  </div>

                  {/* Contribution */}
                  <div>
                    <label className="mb-2 block text-body-sm font-medium">
                      Your personal contribution *
                    </label>
                    <Textarea
                      value={breakdown.contribution}
                      onChange={(e) =>
                        updateBreakdown(projectId, "contribution", e.target.value)
                      }
                      placeholder="What did you personally build or contribute?"
                      rows={3}
                    />
                  </div>

                  {/* Complexity Level */}
                  <div>
                    <label className="mb-3 block text-body-sm font-medium">
                      Technical complexity level *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {complexityLevels.map((level) => {
                        const isSelected = breakdown.complexity === level.level;
                        return (
                          <button
                            key={level.level}
                            onClick={() =>
                              updateBreakdown(projectId, "complexity", level.level)
                            }
                            className={`rounded-lg border-2 px-4 py-2 text-left transition-all ${
                              isSelected
                                ? `border-transparent ${level.color}`
                                : "border-border bg-muted/30 hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className="text-body-sm font-semibold">
                              {level.label}
                            </div>
                            <div className="text-caption opacity-80">
                              {level.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tech Used */}
                  <div>
                    <label className="mb-2 block text-body-sm font-medium">
                      Technologies used
                    </label>
                    {breakdown.techUsed.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {breakdown.techUsed.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-body-sm"
                          >
                            {tech}
                            <button
                              onClick={() => removeTech(projectId, tech)}
                              className="rounded-full p-0.5 hover:bg-secondary-foreground/10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={techInputs[projectId] || ""}
                        onChange={(e) =>
                          setTechInputs((prev) => ({
                            ...prev,
                            [projectId]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addTech(projectId)}
                        placeholder="Add technology..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => addTech(projectId)}
                        variant="outline"
                        size="default"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <label className="mb-2 block text-body-sm font-medium">
                      Challenges faced{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Textarea
                      value={breakdown.challenges}
                      onChange={(e) =>
                        updateBreakdown(projectId, "challenges", e.target.value)
                      }
                      placeholder="What technical challenges did you overcome?"
                      rows={2}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 rounded-xl bg-muted/50 p-4">
        <p className="text-body-sm">
          <span className="font-semibold text-primary">
            {data.selectedProjects.filter(isProjectComplete).length}
          </span>{" "}
          of{" "}
          <span className="font-semibold">{data.selectedProjects.length}</span>{" "}
          projects completed
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="flex-1"
          disabled={!allProjectsComplete}
        >
          Preview profile
        </Button>
      </div>
    </div>
  );
}
