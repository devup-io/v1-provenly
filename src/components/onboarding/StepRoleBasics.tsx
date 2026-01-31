import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { ProfileData } from "@/pages/ProfileSetup";

const roleOptions = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-stack Engineer",
  "AI / ML Engineer",
  "DevOps / Cloud",
  "Blockchain / Web3",
  "Designer",
  "Mobile Developer",
];

const popularTechStacks = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "AWS",
  "Docker",
  "GraphQL",
  "Next.js",
  "Tailwind CSS",
  "Go",
  "Rust",
];

type Props = {
  data: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
  onNext: () => void;
};

export function StepRoleBasics({ data, onUpdate, onNext }: Props) {
  const [techInput, setTechInput] = useState("");

  const toggleRole = (role: string) => {
    const newRoles = data.roles.includes(role)
      ? data.roles.filter((r) => r !== role)
      : [...data.roles, role];
    onUpdate({ roles: newRoles });
  };

  const toggleTech = (tech: string) => {
    const newTechStack = data.techStack.includes(tech)
      ? data.techStack.filter((t) => t !== tech)
      : [...data.techStack, tech];
    onUpdate({ techStack: newTechStack });
  };

  const addCustomTech = () => {
    if (techInput.trim() && !data.techStack.includes(techInput.trim())) {
      onUpdate({ techStack: [...data.techStack, techInput.trim()] });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    onUpdate({ techStack: data.techStack.filter((t) => t !== tech) });
  };

  const canContinue = data.roles.length > 0 && data.techStack.length > 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
      <div className="mb-8">
        <h2 className="mb-2 text-display-sm">Tell us about yourself</h2>
        <p className="text-body text-muted-foreground">
          Select your primary roles and tech stack to help founders find you.
        </p>
      </div>

      {/* Roles */}
      <div className="mb-8">
        <label className="mb-4 block text-body font-medium">
          Primary role(s) <span className="text-muted-foreground">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((role) => {
            const isSelected = data.roles.includes(role);
            return (
              <motion.button
                key={role}
                onClick={() => toggleRole(role)}
                whileTap={{ scale: 0.95 }}
                className={`rounded-full px-4 py-2 text-body-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {isSelected && <Check className="mr-1.5 inline h-4 w-4" />}
                {role}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Years of Experience */}
      <div className="mb-8">
        <label className="mb-4 block text-body font-medium">
          Years of experience: <span className="text-primary">{data.yearsOfExperience}+ years</span>
        </label>
        <Slider
          value={[data.yearsOfExperience]}
          onValueChange={(value) => onUpdate({ yearsOfExperience: value[0] })}
          min={0}
          max={15}
          step={1}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-caption text-muted-foreground">
          <span>0 years</span>
          <span>15+ years</span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-8">
        <label className="mb-4 block text-body font-medium">
          Tech stack <span className="text-muted-foreground">(select or add your own)</span>
        </label>

        {/* Selected Tags */}
        {data.techStack.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {data.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-full bg-pastel-mint px-3 py-1.5 text-body-sm font-medium text-pastel-mint-foreground"
              >
                {tech}
                <button
                  onClick={() => removeTech(tech)}
                  className="rounded-full p-0.5 hover:bg-pastel-mint-foreground/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Popular Options */}
        <div className="mb-4 flex flex-wrap gap-2">
          {popularTechStacks
            .filter((tech) => !data.techStack.includes(tech))
            .map((tech) => (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className="rounded-full bg-secondary px-3 py-1.5 text-body-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                + {tech}
              </button>
            ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomTech()}
            placeholder="Add custom technology..."
            className="flex-1"
          />
          <Button onClick={addCustomTech} variant="outline" disabled={!techInput.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Continue Button */}
      <Button onClick={onNext} size="xl" className="w-full" disabled={!canContinue}>
        Continue
      </Button>
    </div>
  );
}
