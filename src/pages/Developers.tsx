import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Github, Star, GitBranch, ChevronDown, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import { useNavigate } from "react-router-dom";
import { CompareDrawer, type CompareDeveloper } from "@/components/CompareDrawer";
import { Checkbox } from "@/components/ui/checkbox";
const mockDevelopers = [
  {
    id: "1",
    name: "Alex Rivera",
    username: "alexrivera",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    roles: ["Full-stack Engineer", "AI / ML Engineer"],
    techStack: ["React", "TypeScript", "Python", "AWS"],
    maxComplexity: "L3",
    totalStars: 390,
    projectCount: 4,
    complexityCounts: { L1: 1, L2: 1, L3: 2 },
  },
  {
    id: "2",
    name: "Sarah Chen",
    username: "sarahchen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    roles: ["Frontend Engineer", "Designer"],
    techStack: ["React", "Vue", "Figma", "Tailwind"],
    maxComplexity: "L2",
    totalStars: 156,
    projectCount: 3,
    complexityCounts: { L1: 1, L2: 2, L3: 0 },
  },
  {
    id: "3",
    name: "Marcus Johnson",
    username: "marcusj",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    roles: ["Backend Engineer", "DevOps / Cloud"],
    techStack: ["Go", "Kubernetes", "PostgreSQL", "AWS"],
    maxComplexity: "L3",
    totalStars: 289,
    projectCount: 5,
    complexityCounts: { L1: 0, L2: 3, L3: 2 },
  },
  {
    id: "4",
    name: "Emily Watson",
    username: "emilywatson",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    roles: ["AI / ML Engineer"],
    techStack: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
    maxComplexity: "L3",
    totalStars: 445,
    projectCount: 6,
    complexityCounts: { L1: 1, L2: 1, L3: 4 },
  },
  {
    id: "5",
    name: "David Kim",
    username: "davidkim",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    roles: ["Blockchain / Web3"],
    techStack: ["Solidity", "Rust", "TypeScript", "Ethereum"],
    maxComplexity: "L2",
    totalStars: 178,
    projectCount: 3,
    complexityCounts: { L1: 1, L2: 2, L3: 0 },
  },
  {
    id: "6",
    name: "Lisa Park",
    username: "lisapark",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    roles: ["Mobile Developer", "Full-stack Engineer"],
    techStack: ["React Native", "Swift", "Node.js", "Firebase"],
    maxComplexity: "L2",
    totalStars: 234,
    projectCount: 4,
    complexityCounts: { L1: 1, L2: 3, L3: 0 },
  },
];

const roleFilters = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-stack Engineer",
  "AI / ML Engineer",
  "DevOps / Cloud",
  "Blockchain / Web3",
  "Designer",
  "Mobile Developer",
];

const techFilters = [
  "React",
  "TypeScript",
  "Python",
  "Node.js",
  "Go",
  "Rust",
  "AWS",
  "Docker",
  "PostgreSQL",
  "GraphQL",
];

const complexityFilters = [
  { value: "L1", label: "L1 – Simple", color: "bg-pastel-mint text-pastel-mint-foreground" },
  { value: "L2", label: "L2 – Intermediate", color: "bg-pastel-yellow text-pastel-yellow-foreground" },
  { value: "L3", label: "L3 – Complex", color: "bg-pastel-peach text-pastel-peach-foreground" },
];

const projectCountOptions = [
  { value: 1, label: "1+ project" },
  { value: 2, label: "2+ projects" },
  { value: 3, label: "3+ projects" },
  { value: 5, label: "5+ projects" },
];

const complexityColors: Record<string, string> = {
  L1: "bg-pastel-mint text-pastel-mint-foreground",
  L2: "bg-pastel-yellow text-pastel-yellow-foreground",
  L3: "bg-pastel-peach text-pastel-peach-foreground",
};

export default function Developers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([]);
  const [minProjectsAtLevel, setMinProjectsAtLevel] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<CompareDeveloper[]>([]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const toggleComplexity = (level: string) => {
    setSelectedComplexity((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearFilters = () => {
    setSelectedRoles([]);
    setSelectedTech([]);
    setSelectedComplexity([]);
    setMinProjectsAtLevel(0);
    setSearchQuery("");
  };

  const toggleCompare = (dev: typeof mockDevelopers[0]) => {
    const compareDev: CompareDeveloper = {
      id: dev.id,
      name: dev.name,
      username: dev.username,
      avatarUrl: dev.avatarUrl,
      roles: dev.roles,
      techStack: dev.techStack,
      maxComplexity: dev.maxComplexity,
      totalStars: dev.totalStars,
      projectCount: dev.projectCount,
      complexityCounts: dev.complexityCounts,
    };

    setSelectedForCompare((prev) => {
      const exists = prev.find((d) => d.id === dev.id);
      if (exists) {
        return prev.filter((d) => d.id !== dev.id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3
      }
      return [...prev, compareDev];
    });
  };

  const isSelectedForCompare = (id: string) => {
    return selectedForCompare.some((d) => d.id === id);
  };

  const filteredDevelopers = mockDevelopers.filter((dev) => {
    const matchesSearch =
      searchQuery === "" ||
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRoles =
      selectedRoles.length === 0 ||
      dev.roles.some((r) => selectedRoles.includes(r));

    const matchesTech =
      selectedTech.length === 0 ||
      dev.techStack.some((t) => selectedTech.includes(t));

    const matchesComplexity =
      selectedComplexity.length === 0 ||
      selectedComplexity.includes(dev.maxComplexity);

    // Check if developer has minimum projects at selected complexity levels
    const matchesMinProjects =
      minProjectsAtLevel === 0 ||
      selectedComplexity.length === 0 ||
      selectedComplexity.some((level) => 
        (dev.complexityCounts[level as keyof typeof dev.complexityCounts] || 0) >= minProjectsAtLevel
      );

    return matchesSearch && matchesRoles && matchesTech && matchesComplexity && matchesMinProjects;
  });

  const hasActiveFilters =
    selectedRoles.length > 0 ||
    selectedTech.length > 0 ||
    selectedComplexity.length > 0 ||
    minProjectsAtLevel > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 pt-28">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-display-sm md:text-display">
            Find verified developers
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Browse developers with real GitHub projects and verified work history.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or technology..."
              className="h-12 pl-12 pr-4"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground">
                {selectedRoles.length + selectedTech.length + selectedComplexity.length + (minProjectsAtLevel > 0 ? 1 : 0)}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-heading-sm">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                  <X className="h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Role Filters */}
            <div className="mb-6">
              <p className="mb-3 text-body-sm font-medium">Role</p>
              <div className="flex flex-wrap gap-2">
                {roleFilters.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`rounded-full px-3 py-1.5 text-body-sm transition-all ${
                      selectedRoles.includes(role)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Filters */}
            <div className="mb-6">
              <p className="mb-3 text-body-sm font-medium">Technology</p>
              <div className="flex flex-wrap gap-2">
                {techFilters.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`rounded-full px-3 py-1.5 text-body-sm transition-all ${
                      selectedTech.includes(tech)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity Filters */}
            <div className="mb-6">
              <p className="mb-3 text-body-sm font-medium">Complexity Level</p>
              <div className="flex flex-wrap gap-2">
                {complexityFilters.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => toggleComplexity(level.value)}
                    className={`rounded-full px-3 py-1.5 text-body-sm font-medium transition-all ${
                      selectedComplexity.includes(level.value)
                        ? level.color
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Projects at Level Filter - only show when complexity is selected */}
            {selectedComplexity.length > 0 && (
              <div>
                <p className="mb-3 text-body-sm font-medium">
                  Min projects at selected level(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {projectCountOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMinProjectsAtLevel(
                        minProjectsAtLevel === option.value ? 0 : option.value
                      )}
                      className={`rounded-full px-3 py-1.5 text-body-sm transition-all ${
                        minProjectsAtLevel === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-caption text-muted-foreground">
                  Filter by developers who have completed multiple projects at your selected complexity level
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Results Count */}
        <p className="mb-6 text-body-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredDevelopers.length}</span>{" "}
          developers
        </p>

        {/* Developer Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
          {filteredDevelopers.map((dev, index) => (
            <motion.div
              key={dev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative cursor-pointer rounded-2xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover ${
                isSelectedForCompare(dev.id) ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              {/* Compare Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompare(dev);
                }}
                className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                  isSelectedForCompare(dev.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 hover:border-primary"
                }`}
              >
                {isSelectedForCompare(dev.id) && <Check className="h-4 w-4" />}
              </button>

              {/* Clickable area for navigation */}
              <div onClick={() => navigate(`/dev/${dev.username}`)}>
                {/* Developer Header */}
                <div className="mb-4 flex items-start gap-4 pr-8">
                  <img
                    src={dev.avatarUrl}
                    alt={dev.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{dev.name}</h3>
                      <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </div>
                    <p className="truncate text-body-sm text-muted-foreground">
                      @{dev.username}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-caption font-bold ${
                      complexityColors[dev.maxComplexity]
                    }`}
                  >
                    {dev.maxComplexity}
                  </span>
                </div>

                {/* Roles */}
                <p className="mb-3 text-body-sm text-muted-foreground">
                  {dev.roles.join(" · ")}
                </p>

                {/* Tech Stack */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {dev.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-secondary px-2.5 py-1 text-caption"
                    >
                      {tech}
                    </span>
                  ))}
                  {dev.techStack.length > 4 && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-caption text-muted-foreground">
                      +{dev.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* Complexity breakdown pills */}
                <div className="mb-4 flex gap-2">
                  {["L1", "L2", "L3"].map((level) => {
                    const count = dev.complexityCounts[level as keyof typeof dev.complexityCounts] || 0;
                    if (count === 0) return null;
                    return (
                      <span
                        key={level}
                        className={`rounded-full px-2 py-0.5 text-caption font-medium ${complexityColors[level]}`}
                      >
                        {count}× {level}
                      </span>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-caption text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {dev.totalStars} stars
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    {dev.projectCount} projects
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDevelopers.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-2 text-heading-sm">No developers found</p>
            <p className="text-body text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear filters
            </Button>
          </div>
        )}
      </main>

      {/* Compare Drawer */}
      <AnimatePresence>
        <CompareDrawer
          selectedDevelopers={selectedForCompare}
          onRemove={(id) => setSelectedForCompare((prev) => prev.filter((d) => d.id !== id))}
          onClear={() => setSelectedForCompare([])}
          onCompare={() => navigate("/compare", { state: { developers: selectedForCompare } })}
        />
      </AnimatePresence>
    </div>
  );
}
