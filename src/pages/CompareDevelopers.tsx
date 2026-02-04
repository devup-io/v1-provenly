import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Star, GitBranch, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import type { CompareDeveloper } from "@/components/CompareDrawer";

const complexityColors: Record<string, string> = {
  L1: "bg-pastel-mint text-pastel-mint-foreground",
  L2: "bg-pastel-yellow text-pastel-yellow-foreground",
  L3: "bg-pastel-peach text-pastel-peach-foreground",
};

const comparisonRows = [
  { key: "roles", label: "Roles" },
  { key: "maxComplexity", label: "Max Complexity" },
  { key: "totalStars", label: "Total Stars" },
  { key: "projectCount", label: "Projects" },
  { key: "L3", label: "L3 Projects" },
  { key: "L2", label: "L2 Projects" },
  { key: "L1", label: "L1 Projects" },
  { key: "techStack", label: "Tech Stack" },
];

export default function CompareDevelopers() {
  const location = useLocation();
  const navigate = useNavigate();
  const developers: CompareDeveloper[] = location.state?.developers || [];

  if (developers.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 pt-28 text-center">
          <h1 className="mb-4 text-display-sm">No developers to compare</h1>
          <p className="mb-8 text-body text-muted-foreground">
            Select at least 2 developers from the directory to compare.
          </p>
          <Button onClick={() => navigate("/developers")}>
            Browse developers
          </Button>
        </main>
      </div>
    );
  }

  const renderValue = (dev: CompareDeveloper, key: string) => {
    switch (key) {
      case "roles":
        return (
          <div className="flex flex-wrap gap-1">
            {dev.roles.map((role) => (
              <span key={role} className="rounded-full bg-primary/10 px-2 py-0.5 text-caption text-primary">
                {role}
              </span>
            ))}
          </div>
        );
      case "maxComplexity":
        return (
          <span className={`rounded-full px-2.5 py-1 text-caption font-bold ${complexityColors[dev.maxComplexity]}`}>
            {dev.maxComplexity}
          </span>
        );
      case "totalStars":
        return (
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-pastel-yellow-foreground" />
            {dev.totalStars}
          </span>
        );
      case "projectCount":
        return (
          <span className="flex items-center gap-1.5">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            {dev.projectCount}
          </span>
        );
      case "L1":
      case "L2":
      case "L3":
        const count = dev.complexityCounts[key as keyof typeof dev.complexityCounts] || 0;
        return (
          <span className={`rounded-full px-2 py-0.5 text-caption font-medium ${complexityColors[key]}`}>
            {count}
          </span>
        );
      case "techStack":
        return (
          <div className="flex flex-wrap gap-1">
            {dev.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="rounded-full bg-secondary px-2 py-0.5 text-caption">
                {tech}
              </span>
            ))}
            {dev.techStack.length > 4 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                +{dev.techStack.length - 4}
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Find best values for highlighting
  const getBestDev = (key: string): string[] => {
    if (key === "totalStars") {
      const max = Math.max(...developers.map((d) => d.totalStars));
      return developers.filter((d) => d.totalStars === max).map((d) => d.id);
    }
    if (key === "projectCount") {
      const max = Math.max(...developers.map((d) => d.projectCount));
      return developers.filter((d) => d.projectCount === max).map((d) => d.id);
    }
    if (key === "L1" || key === "L2" || key === "L3") {
      const max = Math.max(...developers.map((d) => d.complexityCounts[key as keyof typeof d.complexityCounts] || 0));
      if (max === 0) return [];
      return developers.filter((d) => (d.complexityCounts[key as keyof typeof d.complexityCounts] || 0) === max).map((d) => d.id);
    }
    if (key === "maxComplexity") {
      const levels = ["L3", "L2", "L1"];
      for (const level of levels) {
        const matching = developers.filter((d) => d.maxComplexity === level);
        if (matching.length > 0) return matching.map((d) => d.id);
      }
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 pt-28">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/developers")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to developers
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-display-sm md:text-display">
            Compare Developers
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Side-by-side comparison of {developers.length} developers
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        >
          {/* Developer Headers */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${developers.length}, 1fr)` }}>
            <div className="p-4 font-medium text-muted-foreground">Developer</div>
            {developers.map((dev) => (
              <div key={dev.id} className="border-l border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={dev.avatarUrl}
                      alt={dev.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-sm ring-2 ring-card">
                      <Github className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{dev.name}</h3>
                    <p className="text-caption text-muted-foreground">@{dev.username}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1.5"
                  onClick={() => navigate(`/dev/${dev.username}`)}
                >
                  View Profile
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          {comparisonRows.map((row, index) => {
            const bestDevIds = getBestDev(row.key);
            return (
              <div
                key={row.key}
                className={`grid ${index < comparisonRows.length - 1 ? "border-b border-border" : ""}`}
                style={{ gridTemplateColumns: `200px repeat(${developers.length}, 1fr)` }}
              >
                <div className="flex items-center p-4 text-body-sm font-medium text-muted-foreground">
                  {row.label}
                </div>
                {developers.map((dev) => {
                  const isBest = bestDevIds.includes(dev.id) && bestDevIds.length < developers.length;
                  return (
                    <div
                      key={dev.id}
                      className={`flex items-center border-l border-border p-4 ${isBest ? "bg-pastel-mint/20" : ""}`}
                    >
                      {renderValue(dev, row.key)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
