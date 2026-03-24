import type { Repo } from "@/types/api";

export type ShowcaseRole =
  | "Frontend Developer"
  | "Backend Developer"
  | "Full-stack Developer"
  | "Mobile Developer"
  | "AI / ML Developer"
  | "DevOps Engineer"
  | "Blockchain / Web3 Developer"
  | "Data Engineer / Scientist"
  | "Security Engineer"
  | string;

export const scoreRepoForShowcase = (repo: Repo): number => {
  const commits = repo.commits_count ?? 0;
  const stars = repo.stars ?? 0;
  const forks = repo.forks ?? 0;
  const complexityBoost =
    repo.difficulty_tier === "Advanced"
      ? 20
      : repo.difficulty_tier === "Intermediate"
      ? 12
      : repo.difficulty_tier === "Beginner"
      ? 6
      : 0;
  const alignmentPenalty = repo.role_mismatch ? 18 : 0;
  const unsupportedPenalty =
    repo.detected_project_type === "Unsupported" || repo.evaluation_profile === "Unsupported" ? 20 : 0;
  const importPenalty = repo.already_imported ? 5 : 0;

  return commits * 0.5 + stars * 1.5 + forks * 1.2 + complexityBoost - alignmentPenalty - unsupportedPenalty - importPenalty;
};

export const getRecommendedRepoIds = (repos: Repo[], limit = 3): string[] => {
  return [...repos]
    .filter((repo) => !repo.already_imported)
    .sort((a, b) => scoreRepoForShowcase(b) - scoreRepoForShowcase(a))
    .slice(0, limit)
    .map((repo) => repo.id);
};

export const getRoleAlignmentWarning = (repo: Repo, selectedRole?: ShowcaseRole): string | null => {
  if (repo.role_mismatch && repo.role_mismatch_note) {
    return repo.role_mismatch_note;
  }

  if (!selectedRole || !repo.detected_project_type) {
    return null;
  }

  const role = selectedRole.toLowerCase();
  const detected = repo.detected_project_type.toLowerCase();

  if (role.includes("frontend") && detected.includes("backend")) {
    return "This project looks more backend-focused. Consider aligning your profile with your actual work.";
  }

  if (role.includes("backend") && detected.includes("frontend")) {
    return "This project looks more frontend-focused. Consider aligning your profile with your actual work.";
  }

  if (role.includes("mobile") && !detected.includes("mobile")) {
    return "This project may not strongly support a mobile profile focus.";
  }

  return null;
};
