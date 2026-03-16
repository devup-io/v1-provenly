import { motion } from "framer-motion";
import { Github, Star, GitBranch, Calendar, Check, CheckCircle2, ArrowLeft, GitCommit, Lock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { getDeveloper, fetchGitHubOrganizations, fetchReposByOwner, fetchAvailableRepos, getDeveloperProjects, getCurrentDeveloper, importSelectedRepos } from "@/lib/api";
import type { ProfileData } from "@/pages/ProfileSetup";
import type { Repo, GitHubOrganization } from "@/types/api";

// No hardcoded mock repositories — repos are fetched from GitHub

const languageColors: Record<string, string> = {
  TypeScript: "bg-pastel-blue",
  Python: "bg-pastel-yellow",
  Rust: "bg-pastel-peach",
  Go: "bg-pastel-mint",
  JavaScript: "bg-pastel-yellow",
  Unknown: "bg-secondary",
};

type Props = {
  data: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => void;
  onNext: () => void;
  onBack: () => void;
  isImportingMore?: boolean;
};

export function StepGitHubProjects({ data, onUpdate, onNext, onBack, isImportingMore }: Props) {
  // translate backend skip reasons into human‑friendly messages
  const normalizeSkipReason = (reason: string) => {
    const lower = reason.toLowerCase();
    if (lower.includes('dev type') || lower.includes('role')) {
      return "Repo doesn't align with your selected role";
    }
    return reason;
  };
  const maxProjects = 10;
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 5; // show five repos per page

  const [isImporting, setIsImporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [queueThreshold, setQueueThreshold] = useState<number | null>(null);
  const [queuedNotice, setQueuedNotice] = useState(false);
  const [skippedRepos, setSkippedRepos] = useState<Array<{ repo: string; reason: string }>>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // when user confirms warning once, we don't show again this session
  const [confirmedAlignment, setConfirmedAlignment] = useState(false);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>("personal");
  const [username, setUsername] = useState<string>("");
  const [selectedRepoFullNames, setSelectedRepoFullNames] = useState<Set<string>>(new Set());

  // Fetch organizations on mount
  useEffect(() => {
    const dev = getDeveloper();
    if (!dev) return;
    
    const userLogin = dev?.github_username || (dev as { username?: string }).username;
    if (userLogin) {
      setUsername(userLogin);
    }

    const loadOrganizations = async () => {
      try {
        const orgs = await fetchGitHubOrganizations();
        setOrganizations(orgs);
      } catch {
        setOrganizations([]);
      }
    };

    loadOrganizations();
  }, []);

  // Fetch repos when selected owner changes
  const { settings } = useSettings();

  const loadRepos = async () => {
    // we can fetch personal repos even if username isn't known yet
    setRepoError(null);
    setLoadingRepos(true);
    try {
      const includeOrgs = settings.include_org_repos === false ? false : null;
      const resp = await fetchAvailableRepos(
        selectedOwner === "personal" ? "personal" : selectedOwner,
        100,
        includeOrgs
      );
      const formattedRepos = resp.import_results.map((r) => ({
        id: r.repo_id,
        name: r.repo_name,
        language: r.metadata?.language ?? null,
        stars: r.metadata?.stars ?? 0,
        forks: r.metadata?.forks ?? 0,
        lastUpdated: new Date().toISOString(),
        description: r.metadata?.description ?? null,
        url: r.metadata?.url,
        owner: selectedOwner,
        full_name: r.metadata?.full_name,
        already_imported: r.status !== 'available',
        difficulty_tier: r.metadata?.difficulty_tier,
        primary_role_alignment: r.metadata?.primary_role_alignment,
        detected_project_type: r.metadata?.detected_project_type,
        evaluation_profile: r.metadata?.evaluation_profile,
        role_mismatch: r.metadata?.role_mismatch,
        role_mismatch_note: r.metadata?.role_mismatch_note,
      }));

      // show toast if any repos appear misclassified (e.g. web repo flagged mobile)
      const mobileLangs = ['React Native','Swift','Kotlin','Java','Dart'];
      const mismatches = formattedRepos.filter(r =>
        r.detected_project_type === 'Mobile' && r.language && !mobileLangs.includes(r.language)
      );
      if (mismatches.length > 0) {
        toast({
          title: 'Potential misclassification',
          description: `${mismatches.length} repo(s) flagged as mobile but language looks web.`,
        });
      }
      setRepos(formattedRepos);
      setQueueThreshold(resp.queue_threshold || null);
      setSelectedRepoFullNames(new Set());
      setCurrentPage(1);
      onUpdate({ repos: formattedRepos });
    } catch (e) {
      setRepoError("Failed to load repositories. Please try again.");
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    loadRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImportingMore, selectedOwner, username]);
  
  const toggleProject = (repo: Repo) => {
    if (repo.already_imported) return; // Don't allow toggling already imported projects
    
    if (isImportingMore) {
      // For import flow, track full_name not just ID
      const fullName = repo.full_name || `${repo.owner}/${repo.name}`;
      const newSelected = new Set(selectedRepoFullNames);
      if (newSelected.has(fullName)) {
        newSelected.delete(fullName);
      } else if (newSelected.size < maxProjects) {
        newSelected.add(fullName);
      }
      setSelectedRepoFullNames(newSelected);
    } else {
      // For onboarding flow, track ID
      const newSelected = data.selectedProjects.includes(repo.id)
        ? data.selectedProjects.filter((id) => id !== repo.id)
        : data.selectedProjects.length < maxProjects
        ? [...data.selectedProjects, repo.id]
        : data.selectedProjects;
      onUpdate({ selectedProjects: newSelected });
    }
  };

  const { toast } = useToast();

  const handleImport = async () => {
    if (selectedRepoFullNames.size === 0) {
      toast({ title: "Select at least one repo", variant: "destructive" });
      return;
    }

    // confirmation handled above
    setShowConfirm(false);

    // show confirmation if not already confirmed
    if (!confirmedAlignment) {
      setShowConfirm(true);
      return;
    }

    setModalOpen(true);
    setModalMessage(null);
    setQueuedNotice(false);
    setSkippedRepos([]);
    setIsImporting(true);

    const initialProjectCount = await getDeveloperProjects().then((p) => p.length).catch(() => 0);

    try {
      const result = await importSelectedRepos(Array.from(selectedRepoFullNames));
      setQueueThreshold(result.queue_threshold ?? null);
      if (result.skipped) {
        setSkippedRepos(
          result.skipped.map((s) => ({ repo: s.repo, reason: normalizeSkipReason(s.reason) }))
        );
      }

      if (result.status === 'completed') {
        const importedCount = Array.isArray(result.imported_projects)
          ? result.imported_projects.length
          : selectedRepoFullNames.size;
        setModalMessage(`${importedCount} repos imported`);
        // refresh available list after a short pause
        setTimeout(() => {
          setModalOpen(false);
          loadRepos();
          onNext();
        }, 2000);
      } else if (result.status === 'queued') {
        const threshold = result.queue_threshold || 'unknown';
        toast({ title: `Your selection has been queued for import (threshold ${threshold}). Repos will appear shortly.` });
        setQueuedNotice(true);
        // start polling for new projects
        const start = Date.now();
        const poll = async () => {
          const now = Date.now();
          if (now - start > 60000) return; // timeout 60s
          try {
            const projects = await getDeveloperProjects();
            if (projects.length > initialProjectCount) {
              // new items arrived
              setQueuedNotice(false);
              loadRepos();
              onNext();
              return;
            }
          } catch {
            // keep polling while backend finalizes import
          }
          setTimeout(poll, 3000);
        };
        poll();
        setModalOpen(false);
      } else {
        // failed or unknown status
        setModalOpen(false);
        toast({ title: `Import response: ${result.status}`, variant: 'destructive' });
      }
      setSelectedRepoFullNames(new Set());
    } catch (err) {
      setModalOpen(false);
      toast({ title: "Import failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };


  const minRequired = isImportingMore ? 1 : 2;
  const selectedCount = isImportingMore ? selectedRepoFullNames.size : data.selectedProjects.length;
  const canContinue = selectedCount >= minRequired;

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
      <div className="mb-8">
        <h2 className="mb-2 text-display-sm">
          {isImportingMore ? "Add more projects" : "Select your best projects"}
        </h2>
        <p className="text-body text-muted-foreground">
          {isImportingMore
            ? "Choose 1 or more new projects to add to your profile."
            : "Choose 2–5 projects that best represent your skills. These will be showcased on your profile."}
        </p>
        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-body-sm text-yellow-900">
          <strong>Warning:</strong> to get jobs aligned with your role, make sure you import projects that match your declared dev_type and tech stack. Repositories that deviate may flag your account for suspicion; if we detect a pattern of unrelated languages/technologies your job visibility will drop and your account could be temporarily suspended.
        </div>
      </div>

      {/* Organization Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-body-sm font-medium">
          Select organization or personal repos
        </label>
        <Select value={selectedOwner} onValueChange={setSelectedOwner}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose organization or personal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">
              <span className="flex items-center gap-2">
                <Github className="h-3.5 w-3.5" />
                {username ? `${username} (Personal)` : "Personal Repositories"}
              </span>
            </SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.login}>
                <span className="flex items-center gap-2">
                  <Github className="h-3.5 w-3.5" />
                  {org.login}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-caption text-muted-foreground">
          {organizations.length > 0
            ? `Showing repositories from ${selectedOwner === "personal" ? "your personal account" : selectedOwner}`
            : "Loading organizations..."}
        </p>
      </div>

      {/* Selection Counter */}
      {settings.import_queue_threshold !== undefined && (
        <div className="mb-2 text-caption text-muted-foreground">
          Note: importing more than {settings.import_queue_threshold} repos will queue the request.
        </div>
      )}
      <div className="mb-6 rounded-xl bg-muted/50 p-4">
        <p className="text-body-sm">
          <span className="font-semibold text-primary">{selectedCount}</span> of{" "}
          <span className="font-semibold">{repos.length}</span> repositories selected
          {selectedCount < minRequired && (
            <span className="ml-2 text-muted-foreground">
              (minimum {minRequired} required)
            </span>
          )}
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          {isImportingMore
            ? "You can select up to 10 projects total on your profile"
            : "You can select up to 10 projects to showcase on your profile"}
        </p>
      </div>

      {/* Project Grid */}
      <div className="mb-8 space-y-3">
        {loadingRepos && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {repoError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p>{repoError}</p>
          <Button variant="outline" size="sm" onClick={() => loadRepos()} className="mt-2">
            Retry
          </Button>
        </div>
      )}
      {!loadingRepos && repos.length === 0 && !repoError && (
        <p className="text-center text-muted-foreground">No repositories found for this owner.</p>
      )}
      {(loadingRepos ? [] : (
        // paginate repositories in client
        repos.slice((currentPage - 1) * reposPerPage, currentPage * reposPerPage)
      )).map((repo, index) => {
          const fullName = repo.full_name || `${repo.owner}/${repo.name}`;
          const isSelected = isImportingMore
            ? selectedRepoFullNames.has(fullName)
            : data.selectedProjects.includes(repo.id);
          const isAlreadyImported = repo.already_imported || false;

          return (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleProject(repo)}
              className={`rounded-xl border-2 p-4 transition-all ${
                isAlreadyImported
                  ? "border-muted/50 bg-muted/20 cursor-not-allowed opacity-60"
                  : isSelected
                  ? "cursor-pointer border-primary bg-primary/5"
                  : "cursor-pointer border-border bg-muted/30 hover:border-muted-foreground/30"
              }`}
            >
              {/* evaluation badges */}
              {(repo.difficulty_tier || repo.detected_project_type || repo.evaluation_profile) && (
                <div className="mb-2 flex flex-wrap gap-2 text-caption text-muted-foreground">
                  {repo.difficulty_tier && <span>{repo.difficulty_tier} complexity</span>}
                  {repo.detected_project_type && <span>Type: {repo.detected_project_type}</span>}
                  {repo.evaluation_profile && <span>Profile: {repo.evaluation_profile}</span>}
                </div>
              )}
              {(repo.detected_project_type === 'Unsupported' || repo.evaluation_profile === 'Unsupported') && (
                <div className="mb-2 rounded-md bg-destructive/10 p-1 text-destructive text-caption">
                  Unsupported project – generic evaluation
                </div>
              )}
              {repo.role_mismatch && (
                <div className="mb-2 flex items-center gap-1.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 px-3 py-1.5 text-caption text-yellow-900 dark:text-yellow-200">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span><strong>Role conflict:</strong> {repo.role_mismatch_note || "This repo doesn't align with your declared role – importing may reduce visibility."}</span>
                </div>
              )}
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    isAlreadyImported
                      ? "border-muted/50 bg-muted"
                      : isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {isAlreadyImported ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    isSelected && <Check className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate font-semibold">{repo.name}</h3>
                    {isAlreadyImported && (
                      <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-caption font-medium text-muted-foreground">
                        Already imported
                      </span>
                    )}
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-caption font-medium ${
                        languageColors[String(repo.language ?? "Unknown")] || "bg-secondary"
                      }`}
                    >
                      {repo.language ?? "Unknown"}
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
                    {repo.commits_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <GitCommit className="h-3.5 w-3.5" />
                        {repo.commits_count}
                      </span>
                    )}
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

      {/* pagination controls */}
      {repos.length > reposPerPage && (
        <div className="mb-4 flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-caption">
            Page {currentPage} of {Math.ceil(repos.length / reposPerPage)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(repos.length / reposPerPage), p + 1))}
            disabled={currentPage === Math.ceil(repos.length / reposPerPage)}
          >
            Next
          </Button>
        </div>
      )}

      {/* queue helper and notifications */}
      {queueThreshold !== null && (
        <div className="mb-4 text-caption text-muted-foreground">
          Queue threshold: {queueThreshold} repos. Selections above this are queued.
        </div>
      )}
      {queuedNotice && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-yellow-100 p-3 text-yellow-900">
          <span>Your import is queued; repos will appear shortly.</span>
          <Button size="sm" variant="outline" onClick={() => loadRepos()}>
            Refresh now
          </Button>
        </div>
      )}
      {skippedRepos.length > 0 && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-destructive">
          <p className="font-semibold">Some repos were skipped:</p>
          <ul className="list-disc pl-5">
            {skippedRepos.map((s) => (
              <li key={s.repo}>
                {s.repo}: {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}

      {/* import feedback modal */}
      <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Importing Repositories</DialogTitle>
            <DialogDescription>
              {modalMessage ? "Success!" : "Please wait while we queue your repos..."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            {modalMessage ? (
              <div>
                {/* larger checkmark inside circle */}
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <p className="text-body mt-2">{modalMessage}</p>
              </div>
            ) : (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex gap-3">
        {!isImportingMore && (
          <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {isImportingMore ? (
          <Button
            onClick={handleImport}
            size="lg"
            className="w-full gap-2"
            disabled={!canContinue || isImporting}
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isImporting ? "Importing..." : "Import"}
          </Button>
        ) : (
          <Button onClick={onNext} size="lg" className="flex-1" disabled={!canContinue}>
            Continue
          </Button>
        )}
      </div>
    {/* confirmation dialog should be inside root */}
    <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alignment Notice</DialogTitle>
          <DialogDescription>
            Make sure the projects you select for import align with your declared role and tech stack. Importing unrelated repositories may harm your visibility and could trigger account reviews.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={() => { setConfirmedAlignment(true); setShowConfirm(false); handleImport(); }}>
            I understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );}