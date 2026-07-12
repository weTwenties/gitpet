import type { PetEngineInput } from "./schema";

/**
 * Fixture input for the landing demo and future tests.
 * Lets every layer above the engine run without touching GitHub.
 */
export function demoEngineInput(username = "khanhvinhnguyen"): PetEngineInput {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 86_400_000).toISOString();

  return {
    username,
    repos: [
      { name: "portfolio", language: "TypeScript", pushedAt: daysAgo(3), fork: false, archived: false },
      { name: "design-lab", language: "TypeScript", pushedAt: daysAgo(12), fork: false, archived: false },
      { name: "api-playground", language: "Go", pushedAt: daysAgo(25), fork: false, archived: false },
      { name: "notebooks", language: "Python", pushedAt: daysAgo(60), fork: false, archived: false },
      { name: "dotfiles", language: "Shell", pushedAt: daysAgo(90), fork: false, archived: false },
    ],
    activity: {
      band: "active",
      activeDays: 14,
      pushes: 32,
      pullRequests: 5,
      reviews: 3,
      recentRelease: false,
      latestEventDate: daysAgo(0).slice(0, 10),
    },
  };
}
