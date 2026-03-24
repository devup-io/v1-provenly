import { describe, it, expect } from "vitest";
import { getRecommendedRepoIds, getRoleAlignmentWarning } from "@/lib/project-showcase";
import type { Repo } from "@/types/api";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("recommends highest-signal repositories", () => {
    const repos: Repo[] = [
      {
        id: "a",
        developer_id: "dev-1",
        name: "low",
        stars: 1,
        forks: 0,
        commits_count: 5,
      },
      {
        id: "b",
        developer_id: "dev-1",
        name: "high",
        stars: 30,
        forks: 10,
        commits_count: 100,
        difficulty_tier: "Advanced",
      },
      {
        id: "c",
        developer_id: "dev-1",
        name: "mid",
        stars: 10,
        forks: 3,
        commits_count: 40,
      },
    ];

    expect(getRecommendedRepoIds(repos, 2)).toEqual(["b", "c"]);
  });

  it("returns role alignment warning for obvious role mismatch", () => {
    const repo: Repo = {
      id: "r1",
      developer_id: "dev-1",
      name: "service-api",
      detected_project_type: "Backend",
    };

    expect(getRoleAlignmentWarning(repo, "Frontend Developer")).toContain("backend-focused");
  });
});
