import type { ActivitySignals, PetEngineInput, RepoSignal } from "@/lib/pet-engine";

/**
 * Server-side GitHub collector (roadmap Phase 2).
 * - Never runs in the browser: no token exposure, one shared cache for everyone.
 * - Uses Next.js data cache (revalidate) so each username costs at most a few
 *   GitHub calls per TTL window, regardless of page views.
 * - Works unauthenticated (60 req/h). Set GITHUB_TOKEN in env to raise limits.
 */

const API = "https://api.github.com";

/** TTLs in seconds (roadmap suggested values). */
const PROFILE_TTL = 60 * 60 * 24;
const REPOS_TTL = 60 * 60 * 12;
const EVENTS_TTL = 60 * 30;

export class GitHubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user not found: ${username}`);
    this.name = "GitHubUserNotFoundError";
  }
}

export class GitHubRateLimitedError extends Error {
  constructor() {
    super("GitHub API rate limit reached");
    this.name = "GitHubRateLimitedError";
  }
}

export type GitHubPublicUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  created_at: string;
};

type RawRepo = {
  name: string;
  language: string | null;
  pushed_at: string | null;
  fork: boolean;
  archived: boolean;
};

type RawEvent = {
  type: string;
  created_at: string;
  payload?: { action?: string };
};

/** GitHub username rules: alphanumeric + inner hyphens, max 39 chars. */
export function isValidGitHubUsername(value: string): boolean {
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value);
}

async function githubFetch<T>(path: string, revalidate: number): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "gitpet",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`${API}${path}`, { headers, next: { revalidate } });

  if (response.status === 404) throw new GitHubUserNotFoundError(path);
  if (
    response.status === 429 ||
    (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")
  ) {
    throw new GitHubRateLimitedError();
  }
  if (!response.ok) throw new Error(`GitHub ${path} responded ${response.status}`);

  return (await response.json()) as T;
}

export async function getPublicUser(username: string): Promise<GitHubPublicUser> {
  return githubFetch<GitHubPublicUser>(
    `/users/${encodeURIComponent(username)}`,
    PROFILE_TTL,
  );
}

async function getRepoSignals(username: string): Promise<RepoSignal[]> {
  const repos = await githubFetch<RawRepo[]>(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
    REPOS_TTL,
  );
  return repos
    .filter((repo) => repo.pushed_at)
    .map((repo) => ({
      name: repo.name,
      language: repo.language,
      pushedAt: repo.pushed_at as string,
      fork: repo.fork,
      archived: repo.archived,
    }));
}

/** Normalize raw public events into activity bands. Raw commit counts are never a score. */
function toActivitySignals(events: RawEvent[]): ActivitySignals {
  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;

  const recent = events.filter((event) => new Date(event.created_at).getTime() >= weekAgo);
  const pushes = recent.filter((event) => event.type === "PushEvent").length;
  const pullRequests = events.filter((event) => event.type === "PullRequestEvent").length;
  const reviews = events.filter((event) => event.type === "PullRequestReviewEvent").length;
  const recentRelease = recent.some((event) => event.type === "ReleaseEvent");
  const activeDays = new Set(events.map((event) => event.created_at.slice(0, 10))).size;

  const weekEventCount = recent.length;
  const band: ActivitySignals["band"] =
    weekEventCount === 0 ? "none" : weekEventCount <= 5 ? "light" : weekEventCount <= 20 ? "active" : "intense";

  return {
    band,
    activeDays,
    pushes,
    pullRequests,
    reviews,
    recentRelease,
    latestEventDate: events[0]?.created_at.slice(0, 10) ?? null,
  };
}

async function getActivitySignals(username: string): Promise<ActivitySignals> {
  try {
    const events = await githubFetch<RawEvent[]>(
      `/users/${encodeURIComponent(username)}/events/public?per_page=100`,
      EVENTS_TTL,
    );
    return toActivitySignals(events);
  } catch (error) {
    if (error instanceof GitHubRateLimitedError) throw error;
    // Events API is flaky for some accounts — degrade to "resting" instead of failing the page.
    return toActivitySignals([]);
  }
}

export type CollectedPetData = {
  user: GitHubPublicUser;
  engineInput: PetEngineInput;
};

/** One call per page/card render: profile + normalized engine input. */
export async function collectPetData(username: string): Promise<CollectedPetData> {
  const user = await getPublicUser(username);
  const [repos, activity] = await Promise.all([
    getRepoSignals(user.login),
    getActivitySignals(user.login),
  ]);

  return {
    user,
    engineInput: {
      username: user.login,
      repos,
      activity,
      syncedAt: new Date(),
    },
  };
}
