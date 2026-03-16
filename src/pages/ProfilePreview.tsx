import { motion } from "framer-motion";
import { Github, Star, GitBranch, Edit2, Globe, CheckCircle2, ExternalLink, Loader2, AlertCircle, Plus, BookOpen, Code2, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentDeveloper, getDeveloperProjects, getAggregateEvaluation, updateDeveloperProfile, getProfilePreview, publishProfile, getSupportedDevTypes } from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";
import type { DeveloperProfile, Project, AggregateEvaluation } from "@/types/api";

const complexityLabels: Record<string, string> = {
  Beginner: "Beginner",
  Intermediate: "Intermediate", 
  Advanced: "Advanced",
  Expert: "Expert",
};

const PROJECTS_PER_PAGE = 3;

const COMMON_TECHNOLOGIES = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Vue.js",
  "Angular",
  "Next.js",
  "Express",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  "ASP.NET",
  "Laravel",
  "Rails",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST API",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Terraform",
  "Jenkins",
  "Git",
  "GitHub Actions",
  "CI/CD",
  "TailwindCSS",
  "Material UI",
  "Chakra UI",
  "Sass",
  "WebSocket",
  "Socket.io",
  "Blockchain",
  "Solidity",
  "Web3",
];

export default function ProfilePreview() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasEverPublished, setHasEverPublished] = useState(false);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<AggregateEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [techSearchQuery, setTechSearchQuery] = useState("");
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    primary_role: '',
    bio: '',
    primary_stack: [] as string[],
  });

  // supported roles validation hooks must be declared before any conditional returns
  const [supportedRoles, setSupportedRoles] = useState<string[]>([]);
  const [roleError, setRoleError] = useState<string | null>(null);

  // load supported roles once
  useEffect(() => {
    getSupportedDevTypes().then(setSupportedRoles).catch(() => undefined);
  }, []);

  // validate role when changed
  useEffect(() => {
    if (editForm.primary_role && supportedRoles.length > 0) {
      const normalized = editForm.primary_role.toLowerCase();
      const match = supportedRoles.find(r => r.toLowerCase() === normalized);
      if (!match) {
        setRoleError(`Role '${editForm.primary_role}' is not currently supported`);
      } else {
        setRoleError(null);
      }
    } else {
      setRoleError(null);
    }
  }, [editForm.primary_role, supportedRoles]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {

        // attempt preview endpoint first (may contain publish flag)
        let devData: DeveloperProfile;
        try {
          devData = await getProfilePreview();
        } catch (previewErr) {
          devData = await getCurrentDeveloper();
        }

        // fetch projects and stats
        const [projectsData, statsData] = await Promise.all([
          getDeveloperProjects(devData.id).catch(err => {
            return [];
          }),
          getAggregateEvaluation(devData.id).catch(err => {
            return null;
          }),
        ]);

        // preserve order preferences saved earlier
        const selectedRepoNamesRaw = localStorage.getItem('v1_selected_repo_names');
        let orderedProjects = projectsData || [];
        if (selectedRepoNamesRaw) {
          try {
            const selectedRepoNames = JSON.parse(selectedRepoNamesRaw) as string[];
            const selectedNameSet = new Set(selectedRepoNames.map((n) => n.toLowerCase()));
            if (selectedNameSet.size > 0) {
              const selected = orderedProjects.filter((p) => selectedNameSet.has((p.name || '').toLowerCase()));
              const remaining = orderedProjects.filter((p) => !selectedNameSet.has((p.name || '').toLowerCase()));
              if (selected.length > 0) orderedProjects = [...selected, ...remaining];
            }
          } catch (parseErr) {
          }
        }

        setDeveloper(devData);
        setProjects(orderedProjects);
        setStats(statsData);
        const published = !!devData.is_published || !!devData.profile_complete;
        setIsPublished(published);
        if (published) setHasEverPublished(true);
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile data';
        setError(message);
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  useEffect(() => {
    // Close tech suggestions when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tech-search-container')) {
        setShowTechSuggestions(false);
      }
    };

    if (showTechSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTechSuggestions]);

  const handleEditClick = () => {
    if (developer) {
      setEditForm({
        name: developer.name || '',
        primary_role: developer.primary_role || '',
        bio: developer.bio || '',
        primary_stack: normalizeTechStack(developer.primary_stack) || [],
      });
      setIsEditing(true);
    }
  };

  const { settings } = useSettings();

  const handleSaveEdit = async () => {
    if (!developer) return;
    try {
      setIsSaving(true);
      const updated = await updateDeveloperProfile(developer.id, {
        name: editForm.name,
        primary_role: editForm.primary_role,
        bio: editForm.bio,
        primary_stack: editForm.primary_stack,
      }, settings);
      setDeveloper(updated);
      // editing invalidates current publish state
      setIsPublished(false);
      // user has already published before if the profile was complete earlier
      if (developer?.profile_complete) setHasEverPublished(true);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddTech = (tech: string) => {
    if (tech && !editForm.primary_stack.includes(tech)) {
      setEditForm(prev => ({
        ...prev,
        primary_stack: [...prev.primary_stack, tech]
      }));
      setTechSearchQuery("");
      setShowTechSuggestions(false);
    }
  };

  const handleRemoveTech = (tech: string) => {
    setEditForm(prev => ({
      ...prev,
      primary_stack: prev.primary_stack.filter(t => t !== tech)
    }));
  };

  const handlePublish = async () => {
    if (!developer || !developer.profile_complete) return;
    setIsPublishing(true);
    try {
      await publishProfile();
      setIsPublished(true);
      setHasEverPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish profile');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-body text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-8">
        <div className="container max-w-3xl">
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-destructive mt-1" />
              <div>
                <h3 className="font-semibold text-destructive">Error Loading Profile</h3>
                <p className="text-body-sm text-muted-foreground mt-2">
                  {error || 'Unable to load your profile. Please try again.'}
                </p>
                <Button onClick={() => navigate('/dashboard')} className="mt-4">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normalize tech stack - handle cases where backend returns concatenated string
  const normalizeTechStack = (stack: string[] | string | undefined): string[] => {
    if (!stack) return [];
    
    // Common technology names for better splitting
    const knownTechs = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
      'Vue.js', 'Angular', 'Next.js', 'Express', 'Django', 'Flask', 'FastAPI',
      'Spring', 'ASP.NET', 'Laravel', 'Rails', 'PostgreSQL', 'MySQL', 'MongoDB',
      'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'GraphQL', 'REST',
      'Backend', 'Frontend', 'Full-stack', 'DevOps'
    ];
    
    // If it's already a proper array with multiple items, return it
    if (Array.isArray(stack) && stack.length > 1) {
      // Check if any item is a concatenated string
      const normalized = stack.flatMap(tech => {
        if (tech.length > 30 && !tech.includes(' ')) {
          return splitConcatenatedTech(tech, knownTechs);
        }
        return [tech];
      });
      return normalized;
    }
    
    // If it's a single-item array, check if it's concatenated
    if (Array.isArray(stack) && stack.length === 1) {
      const item = stack[0];
      if (item.length > 30 && !item.includes(' ')) {
        const split = splitConcatenatedTech(item, knownTechs);
        return split.length > 1 ? split : stack;
      }
      return stack;
    }
    
    // If it's a string, convert to array
    if (typeof stack === 'string') {
      if (stack.includes(',')) return stack.split(',').map(s => s.trim());
      if (stack.includes(';')) return stack.split(';').map(s => s.trim());
      if (stack.length > 30 && !stack.includes(' ')) {
        const split = splitConcatenatedTech(stack, knownTechs);
        return split.length > 1 ? split : [stack];
      }
      return [stack];
    }
    
    return [];
  };

  // Helper to split concatenated technology names
  const splitConcatenatedTech = (text: string, knownTechs: string[]): string[] => {
    const result: string[] = [];
    let remaining = text;
    
    // Try to match known technologies first
    while (remaining.length > 0) {
      let matched = false;
      for (const tech of knownTechs) {
        if (remaining.startsWith(tech)) {
          result.push(tech);
          remaining = remaining.slice(tech.length);
          matched = true;
          break;
        }
      }
      
      // If no known tech matched, try to split on case changes
      if (!matched) {
        const match = remaining.match(/^[A-Z][a-z]+/);
        if (match) {
          result.push(match[0]);
          remaining = remaining.slice(match[0].length);
        } else {
          // Can't split further, add remainder
          if (remaining) result.push(remaining);
          break;
        }
      }
    }
    
    return result.length > 0 ? result : [text];
  };

  // Prepare tech stack from developer.primary_stack first, then fall back to stats or projects
  const techStack = developer?.primary_stack?.length > 0 
    ? normalizeTechStack(developer.primary_stack)
    : stats?.primary_technologies || 
      projects
        .flatMap(p => {
          if (p.ai_evaluation?.overall_assessment) {
            // Try to extract tech from assessment text
            return [];
          }
          return p.language ? [p.language] : [];
        })
        .filter(Boolean)
        .slice(0, 6) ||
      [];


  // Edit mode UI
  if (isEditing && developer) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container max-w-3xl">
          <Button variant="outline" onClick={handleCancelEdit} className="mb-8">
            ← Back to Preview
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] border border-border bg-card shadow-lg p-8"
          >
            <h2 className="text-heading-md mb-8">Edit Profile</h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="text-body-sm font-semibold text-foreground mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-body-sm font-semibold text-foreground mb-2 block">
                  Role
                </label>
                <input
                  type="text"
                  value={editForm.primary_role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, primary_role: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your role (e.g., Full-stack Developer)"
                />
                {supportedRoles.length > 0 && (
                  <p className="mt-1 text-caption text-muted-foreground">
                    Supported roles: {supportedRoles.join(', ')}
                  </p>
                )}
                {roleError && (
                  <p className="mt-1 text-caption text-destructive">{roleError}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="text-body-sm font-semibold text-foreground mb-2 block">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about yourself"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="text-body-sm font-semibold text-foreground mb-2 block">
                  Technologies
                </label>
                <div className="relative mb-4 tech-search-container">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={techSearchQuery}
                        onChange={(e) => {
                          setTechSearchQuery(e.target.value);
                          setShowTechSuggestions(true);
                        }}
                        onFocus={() => setShowTechSuggestions(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && techSearchQuery) {
                            e.preventDefault();
                            handleAddTech(techSearchQuery);
                          } else if (e.key === 'Escape') {
                            setShowTechSuggestions(false);
                          }
                        }}
                        placeholder="Search technologies..."
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {showTechSuggestions && techSearchQuery && (
                        <div className="absolute top-full mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-10">
                          {COMMON_TECHNOLOGIES
                            .filter(tech => 
                              tech.toLowerCase().includes(techSearchQuery.toLowerCase()) &&
                              !editForm.primary_stack.includes(tech)
                            )
                            .slice(0, 10)
                            .map((tech) => (
                              <button
                                key={tech}
                                type="button"
                                onClick={() => handleAddTech(tech)}
                                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-body-sm"
                              >
                                {tech}
                              </button>
                            ))}
                          {COMMON_TECHNOLOGIES.filter(tech => 
                            tech.toLowerCase().includes(techSearchQuery.toLowerCase()) &&
                            !editForm.primary_stack.includes(tech)
                          ).length === 0 && (
                            <div className="px-4 py-2 text-body-sm text-muted-foreground">
                              No matching technologies found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        if (techSearchQuery) {
                          handleAddTech(techSearchQuery);
                        }
                      }}
                      variant="outline"
                      disabled={!techSearchQuery}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-caption text-muted-foreground mt-2">
                    Type to search or add custom technology
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.primary_stack.map((tech) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 border border-primary/20"
                    >
                      <span className="text-body-sm">{tech}</span>
                      <button
                        onClick={() => handleRemoveTech(tech)}                        title={`Remove ${tech}`}
                        aria-label={`Remove ${tech}`}                        className="text-muted-foreground hover:text-destructive transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                {editForm.primary_stack.length === 0 && (
                  <p className="text-caption text-muted-foreground mt-2">
                    Add technologies to showcase your skills
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving || !!roleError}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
            {roleError && (
              <p className="mt-2 text-caption text-destructive">{roleError}</p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-heading">Profile Preview</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleEditClick}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
        {/* aggregate stats */}
        {stats && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <h2 className="text-heading-sm mb-2">Aggregate Evaluation</h2>
            <p>Total projects: {stats.total_projects || 0}</p>
            {stats.evaluation_profile_counts && (
              <p>Profiles: {Object.entries(stats.evaluation_profile_counts).map(([k,v])=>`${k}:${v}`).join(', ')}</p>
            )}
            {stats.detected_project_type_counts && (
              <p>Types: {Object.entries(stats.detected_project_type_counts).map(([k,v])=>`${k}:${v}`).join(', ')}</p>
            )}
            {stats.developer_declared_role && (
              <p>Declared role: {stats.developer_declared_role}</p>
            )}
            {stats.developer_declared_role && supportedRoles.length>0 && !supportedRoles.includes(stats.developer_declared_role) && (
              <div className="mt-2 rounded-md bg-yellow-100 p-2 text-yellow-800 text-caption">
                Your declared role (‘{stats.developer_declared_role}’) is not currently supported; evaluations may be limited.
              </div>
            )}
          </div>
        )}
            {!isPublished ? (
              <Button onClick={handlePublish} className="gap-2" disabled={isPublishing || !developer?.profile_complete}>
                {isPublishing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    {hasEverPublished ? 'Republish profile' : 'Publish my profile'}
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

        {/* Published Banner */}
        {isPublished && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between rounded-[24px] bg-pastel-mint p-4 shadow-lg"
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
              provenly.live/dev/{developer.github_username}
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[32px] border border-border bg-card shadow-lg hover:shadow-xl transition-shadow"
        >
          {/* Header Section */}
          <div className="border-b border-border p-8">
            <div className="flex items-start gap-6">
              <img
                src={developer.github_avatar || developer.avatar_url || "https://via.placeholder.com/80"}
                alt={developer.name || developer.github_username}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-display-sm">{developer.name || developer.github_username}</h2>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1">
                    <Github className="h-4 w-4 text-primary-foreground" />
                    <span className="text-caption font-medium text-primary-foreground">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 w-fit">
                  <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                  <p className="text-body font-semibold text-foreground">
                    {developer.primary_role ? (
                      <>
                        {developer.primary_role}
                        {developer.years_of_experience && ` · ${developer.years_of_experience}+ years`}
                      </>
                    ) : (
                      'Developer'
                    )}
                  </p>
                </div>
                {developer.bio && (
                  <div className="mb-4 flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-body text-muted-foreground">
                      {developer.bio}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span className="text-body-sm font-semibold text-foreground">Technologies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.length > 0 ? (
                    techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-secondary px-3 py-1.5 text-body-sm font-medium hover:bg-secondary/80 transition-colors"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-body-sm text-muted-foreground">No technologies yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-sm">Featured Projects</h3>
              {projects.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/profile-setup?step=2')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Import More Projects
                </Button>
              )}
            </div>
            {projects.length > 0 ? (
              <div>
                <div className="space-y-6">
                  {(() => {
                    const startIdx = (currentPage - 1) * PROJECTS_PER_PAGE;
                    const endIdx = startIdx + PROJECTS_PER_PAGE;
                    const paginatedProjects = projects.slice(startIdx, endIdx);
                    return paginatedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="rounded-[24px] bg-gradient-to-br from-card to-muted/10 p-6 shadow-md hover:shadow-lg transition-all"
                  >
                    {/* Project Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{project.name}</h4>
                          {project.ai_evaluation?.difficulty_tier && (
                            <span className={`rounded-full px-2.5 py-0.5 text-caption font-bold bg-pastel-yellow text-pastel-yellow-foreground`}>
                              {project.ai_evaluation.difficulty_tier}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-caption text-muted-foreground">
                          {project.stars !== undefined && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5" />
                              {project.stars}
                            </span>
                          )}
                          {project.forks !== undefined && (
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-3.5 w-3.5" />
                              {project.forks}
                            </span>
                          )}
                        </div>
                      </div>
                      {project.github_url && (
                        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            View repo
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="mb-4 space-y-3">
                      <div>
                        <p className="mb-1 text-caption font-medium uppercase tracking-wider text-muted-foreground">
                          Description
                        </p>
                        <p className="text-body-sm">
                          {project.description || 'No description available'}
                        </p>
                      </div>
                      {project.ai_evaluation?.overall_assessment && (
                        <div>
                          <p className="mb-1 text-caption font-medium uppercase tracking-wider text-muted-foreground">
                            Assessment
                          </p>
                          <p className="text-body-sm">{project.ai_evaluation.overall_assessment}</p>
                        </div>
                      )}
                    </div>

                    {/* Tech Used */}
                    {project.language && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-caption">
                          {project.language}
                        </span>
                      </div>
                    )}

                    {/* View More Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                    >
                      View More About This Project
                    </Button>
                  </motion.div>
                    ));
                  })()}
                </div>

                {/* Pagination Controls */}
                {projects.length > PROJECTS_PER_PAGE && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-center justify-between rounded-[20px] bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-5 shadow-sm"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </Button>
                    <span className="text-body-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(projects.length / PROJECTS_PER_PAGE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(projects.length / PROJECTS_PER_PAGE)))}
                      disabled={currentPage === Math.ceil(projects.length / PROJECTS_PER_PAGE)}
                    >
                      Next →
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-body-sm text-muted-foreground">
                  No projects yet. Import projects from your GitHub to get started.
                </p>
                <Button onClick={() => navigate('/dashboard')} className="mt-4">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
