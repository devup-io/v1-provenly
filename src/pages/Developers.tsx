import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Github, Star, GitBranch, ChevronDown, X, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input"; // still needed for numeric filters
import { Button } from "@/components/ui/button";
import { ErrorScreen } from "@/components/ErrorScreen";
import { Header } from "@/components/landing/Header";
import { useNavigate } from "react-router-dom";
import { CompareDrawer, type CompareDeveloper } from "@/components/CompareDrawer";
import { Checkbox } from "@/components/ui/checkbox";
import type { Developer, DeveloperSearchResponse, DeveloperSearchFilters } from "@/types/developer";
import { searchDevelopers, isRateLimitError, isServiceUnavailableError } from "@/lib/api";
type Dev = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  roles?: string[];
  techStack?: string[];
  maxComplexity?: string;
  totalStars?: number;
  projectCount?: number;
  // structure matches CompareDeveloper requirements
  complexityCounts?: { L1: number; L2: number; L3: number };
  // hiring signal metrics
  verified_projects?: number;
  average_confidence?: number;
  experience_signal?: string;
  contribution_breakdown?: Record<string, number>;
};

// helper to map backend Developer to frontend Dev
const mapBackendDev = (d: Developer): Dev => {
  const stats = d.project_stats || { L1_count: 0, L2_count: 0, L3_count: 0, total_projects: 0 };
  const complexityCounts: { L1: number; L2: number; L3: number } = {
    L1: stats.L1_count || 0,
    L2: stats.L2_count || 0,
    L3: stats.L3_count || 0,
  };
  // determine max complexity with >0 projects
  let maxC: string | undefined;
  if (complexityCounts.L3 > 0) maxC = 'L3';
  else if (complexityCounts.L2 > 0) maxC = 'L2';
  else if (complexityCounts.L1 > 0) maxC = 'L1';

  const totalStarsVal =
    typeof d.total_stars === 'number'
      ? d.total_stars
      : typeof d.stars === 'number'
      ? d.stars
      : undefined;

  return {
    id: d.dev_id || d.id || '',
    name: d.dev_name || d.name || '',
    username: d.username || d.id || '',
    avatarUrl: d.profile_photo || d.avatar_url || undefined,
    roles: d.services || d.roles || [],
    techStack: d.skill_tags || d.tech_stack || [],
    maxComplexity: maxC,
    totalStars: totalStarsVal,
    projectCount: stats.total_projects || 0,
    complexityCounts,
    // additional hiring-signal fields (may be undefined)
    verified_projects: d.verified_projects,
    average_confidence: d.average_confidence,
    experience_signal: d.experience_signal,
    contribution_breakdown: d.contribution_breakdown,
  };
};

const roleFilters = [
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Developer",
  "AI / ML Developer",
  "DevOps / Cloud Developer",
  "Blockchain / Web3 Developer",
  "Designer",
  "Mobile Developer",
];


const contributionOptions: Array<"Primary Builder" | "Major Contributor" | "Minor Contributor"> = [
  "Primary Builder",
  "Major Contributor",
  "Minor Contributor",
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
  // only one complexity level may be selected at a time
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);
  const [minProjectsAtLevel, setMinProjectsAtLevel] = useState<number>(0);
  const [customMinProjectsInput, setCustomMinProjectsInput] = useState<string>("");
  const [minVerified, setMinVerified] = useState<number>(0);
  const [contributionLevel, setContributionLevel] = useState<
    "Primary Builder" | "Major Contributor" | "Minor Contributor" | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<CompareDeveloper[]>([]);
  const [developers, setDevelopers] = useState<Dev[]>([]);
  // simple in-memory cache of search results keyed by JSON filters
  const cacheRef = useRef<Map<string, { developers: Dev[]; totalCount: number; totalPages: number }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
    setSelectedComplexity((prev) => (prev === level ? null : level));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRoles([]);
    setSelectedTech([]);
    setSelectedComplexity(null);
    setMinProjectsAtLevel(0);
    setCustomMinProjectsInput("");
    setMinVerified(0);
    setContributionLevel(null);
  };

  const toggleCompare = (dev: Dev) => {
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

  // results are already filtered by the backend; just use developers array
  const filteredDevelopers = developers;
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedRoles.length > 0 ||
    selectedTech.length > 0 ||
    !!selectedComplexity ||
    minProjectsAtLevel > 0 ||
    minVerified > 0 ||
    Boolean(contributionLevel);

  // fetch with backend search when filters/page change
  const loadDevelopers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorStatusCode(null);
    try {
      const filters: DeveloperSearchFilters = {
        page,
        limit,
      };
      if (searchQuery.trim()) {
        filters.q = searchQuery.trim();
      }
      if (selectedRoles.length > 0) {
        filters.role = selectedRoles[0];
      }
      if (selectedTech.length > 0) {
        filters.technologies = selectedTech;
      }
      if (selectedComplexity) {
        filters.complexity_levels = [selectedComplexity];
      }
      if (minVerified > 0) {
        filters.min_verified_projects = minVerified;
      }
      if (contributionLevel) {
        filters.contribution_level = contributionLevel;
      }
      if (minProjectsAtLevel > 0) {
        // backend expects this name for filtering by number of projects at the selected complexity
        filters.min_selected_level_count = minProjectsAtLevel;
      }
      const cacheKey = JSON.stringify(filters);
      // check cache first
      if (cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey)!;
        setDevelopers(cached.developers);
        setTotalCount(cached.totalCount);
        setTotalPages(cached.totalPages);
        setLoading(false);
      } else {
        try {
          const resp = await searchDevelopers(filters);
          setTotalPages(resp.total_pages || 1);
          setTotalCount(resp.total_count || 0);
          const items = Array.isArray(resp.developers) ? resp.developers : [];
          const mapped = items.map(mapBackendDev);
          setDevelopers(mapped);
          cacheRef.current.set(cacheKey, { developers: mapped, totalCount: resp.total_count || 0, totalPages: resp.total_pages || 1 });
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      const isUnavailable = isServiceUnavailableError(err);
      const isRateLimited = isRateLimitError(err);
      setErrorStatusCode(isUnavailable ? '503' : isRateLimited ? '429' : '500');
      setError(
        isUnavailable
          ? 'Search is temporarily unavailable.'
          : isRateLimited
          ? 'Too many requests. Please wait briefly and try again.'
          : 'Unable to load developers right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedRoles, selectedComplexity, contributionLevel, minVerified, selectedTech, minProjectsAtLevel]);
  useEffect(() => {
    loadDevelopers();
  }, [loadDevelopers]);

  // clear cache when key filters change (especially role)
  useEffect(() => {
    cacheRef.current.clear();
  }, [searchQuery, selectedRoles, selectedTech, selectedComplexity, minProjectsAtLevel, minVerified, contributionLevel]);

  // reset page when filter criteria change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedRoles, selectedTech, selectedComplexity, minProjectsAtLevel, minVerified, contributionLevel]);

  if (errorStatusCode === '503') {
    return (
      <ErrorScreen
        statusCode="503"
        title="Developer search is temporarily unavailable"
        subtitle="Our data services are currently unavailable."
        message="Please try again in a few moments."
        onRetry={() => void loadDevelopers()}
        primaryActionLabel="Retry"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background font-grotesk">
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

        {/* Search + Filter controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or skills"
              className="h-12 pl-10"
              aria-label="Search developers"
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
                {selectedRoles.length + selectedTech.length + (selectedComplexity ? 1 : 0) + (minProjectsAtLevel > 0 ? 1 : 0) + (minVerified > 0 ? 1 : 0) + (contributionLevel ? 1 : 0)}
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

            {/* only show further filters once a role is selected */}
            {selectedRoles.length > 0 && (
              <>
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

                {/* Verified Projects Filter */}
                <div className="mb-6">
                  <p className="mb-3 text-body-sm font-medium">Min verified projects</p>
                  <Input
                    type="number"
                    min={0}
                    value={minVerified}
                    onChange={(e) => setMinVerified(Number(e.target.value))}
                    className="w-24"
                  />
                </div>

                {/* Contribution Level Filter */}
                <div className="mb-6">
                  <p className="mb-3 text-body-sm font-medium">Contribution level</p>
                  <div className="flex flex-wrap gap-2">
                    {contributionOptions.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setContributionLevel(contributionLevel === lvl ? null : lvl)}
                        className={`rounded-full px-3 py-1.5 text-body-sm transition-all ${
                          contributionLevel === lvl
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {lvl}
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
                          selectedComplexity === level.value
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
                {selectedComplexity && (
                  <div>
                    <p className="mb-3 text-body-sm font-medium">
                      Min projects at selected level(s)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {projectCountOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            const nextValue = minProjectsAtLevel === option.value ? 0 : option.value;
                            setMinProjectsAtLevel(nextValue);
                            setCustomMinProjectsInput(nextValue > 0 ? String(nextValue) : '');
                          }}
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
                    <div className="mt-3">
                      <p className="mb-2 text-body-sm font-medium">Custom minimum (founder input)</p>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        placeholder="Enter custom minimum projects"
                        value={customMinProjectsInput}
                        onChange={(e) => {
                          const nextRaw = e.target.value;
                          setCustomMinProjectsInput(nextRaw);
                          const parsed = Number(nextRaw);
                          setMinProjectsAtLevel(Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0);
                        }}
                        className="w-full sm:w-64"
                      />
                    </div>
                    <p className="mt-2 text-caption text-muted-foreground">
                      Filter by developers who have completed multiple projects at your selected complexity level
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Results Count & error */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/5 p-4 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="ghost" onClick={loadDevelopers}>Retry</Button>
          </div>
        )}
        {hasActiveFilters && filteredDevelopers.length > 0 && (
          <p className="mb-6 text-body-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredDevelopers.length}</span> of <span className="font-semibold text-foreground">{totalCount}</span> developers
          </p>
        )}

        {/* Developer Grid (skeletons or results) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
          {loading && !filteredDevelopers.length ? (
            // display skeleton cards while initial search is running
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border bg-card p-6 shadow-card"
              >
                <div className="mb-4 flex items-start gap-4 pr-8">
                  <div className="h-14 w-14 rounded-xl bg-muted" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-3/4 bg-muted" />
                    <div className="h-3 w-1/2 bg-muted" />
                  </div>
                </div>
                <div className="h-4 w-1/2 bg-muted mb-3" />
                <div className="h-3 w-1/3 bg-muted mb-4" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-16 rounded bg-muted" />
                  <div className="h-6 w-16 rounded bg-muted" />
                </div>
              </div>
            ))
          ) : (
            filteredDevelopers.map((dev, index) => (
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
              <div
                onClick={() => {
                  const target = dev.username || dev.id;
                  if (!target) {
                    return;
                  }
                  navigate(`/dev/${target}`);
                }}
              >
                {/* Developer Header */}
                <div className="mb-4 flex items-start gap-4 pr-8">
                  <img
                    src={dev.avatarUrl}
                    alt={dev.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{dev.name || 'N/A'}</h3>
                      <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </div>
                    <p className="truncate text-body-sm text-muted-foreground">
                      @{dev.username || 'unknown'}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-caption font-bold ${
                      complexityColors[dev.maxComplexity || ''] || 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {dev.maxComplexity || 'N/A'}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {dev.roles.slice(0, 2).map((r) => (
                    <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-caption">
                      {r}
                    </span>
                  ))}
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-caption">
                    {dev.experience_signal || 'N/A'}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2 text-caption">
                  <div className="rounded-lg border border-border/60 bg-background/60 px-2 py-1.5 text-muted-foreground">
                    ✅ {dev.verified_projects ?? 0} verified
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 px-2 py-1.5 text-muted-foreground">
                    👥 {dev.contribution_breakdown?.['Primary Builder'] || 0} primary
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 px-2 py-1.5 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {dev.totalStars ?? 0} stars
                    </span>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 px-2 py-1.5 text-muted-foreground" title="Total imported projects (verified projects may be different)">
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      {dev.projectCount ?? 0} projects
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-1">
                  {dev.techStack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-secondary px-2 py-0.5 text-caption"
                    >
                      {tech}
                    </span>
                  ))}
                  {dev.techStack.length > 5 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                      +{dev.techStack.length - 5}
                    </span>
                  )}
                </div>

                <div className="mb-2 flex flex-wrap gap-2">
                  {['L1', 'L2', 'L3'].map((level) => {
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
                  <span className="text-caption text-muted-foreground">
                    {dev.average_confidence !== undefined ? `📊 ${Math.round(dev.average_confidence)}% confidence` : '📊 N/A confidence'}
                  </span>
                </div>
              </div>
            </motion.div>
          )))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mb-12 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
              Prev
            </Button>
            <span className="text-body-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredDevelopers.length === 0 && (
          <div className="py-16 text-center">
            {!hasActiveFilters ? (
              <>
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2 text-heading-sm">No developers to show yet</p>
                <p className="text-body text-muted-foreground">
                  Try searching by name/skill or applying filters to narrow results.
                </p>
              </>
            ) : (
              <>
                <p className="mb-2 text-heading-sm">No developers found</p>
                <p className="text-body text-muted-foreground">
                  Try adjusting your filters.
                </p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Clear filters
                </Button>
              </>
            )}
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
