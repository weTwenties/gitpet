import {
  ARCHETYPES,
  type Archetype,
  type ArchetypeOrUnknown,
  type RepoSignal,
} from "./schema";

/** How far back repository activity influences the tech profile (roadmap Phase 3). */
export const TECH_WINDOW_DAYS = 180;

/**
 * Language → archetype weight distribution. Weights per language sum to 1.
 * A language can influence several archetypes (e.g. Python splits backend/data).
 */
const LANGUAGE_MAP: Record<string, Partial<Record<Archetype, number>>> = {
  JavaScript: { interface: 0.8, backend: 0.2 },
  TypeScript: { interface: 0.7, backend: 0.3 },
  HTML: { interface: 1 },
  CSS: { interface: 1 },
  SCSS: { interface: 1 },
  Vue: { interface: 1 },
  Svelte: { interface: 1 },
  Astro: { interface: 1 },
  Dart: { interface: 0.8, backend: 0.2 },

  PHP: { backend: 1 },
  Ruby: { backend: 1 },
  Java: { backend: 0.8, systems: 0.2 },
  Kotlin: { backend: 0.7, interface: 0.3 },
  "C#": { backend: 0.7, systems: 0.3 },
  Elixir: { backend: 1 },
  Python: { backend: 0.5, data: 0.5 },

  C: { systems: 1 },
  "C++": { systems: 0.9, data: 0.1 },
  Rust: { systems: 0.9, backend: 0.1 },
  Go: { systems: 0.5, backend: 0.5 },
  Zig: { systems: 1 },
  Assembly: { systems: 1 },
  Shell: { systems: 0.6, backend: 0.4 },
  Lua: { systems: 0.6, interface: 0.4 },
  Swift: { interface: 0.6, systems: 0.4 },
  "Objective-C": { interface: 0.5, systems: 0.5 },

  R: { data: 1 },
  Julia: { data: 1 },
  Scala: { data: 0.6, backend: 0.4 },
  "Jupyter Notebook": { data: 1 },
  MATLAB: { data: 1 },
  SQL: { data: 0.7, backend: 0.3 },
  PLpgSQL: { data: 0.7, backend: 0.3 },
};

export type LanguageWeight = { name: string; weight: number };

export type TechProfile = {
  primaryArchetype: ArchetypeOrUnknown;
  secondaryArchetype?: Archetype;
  tertiaryArchetype?: Archetype;
  languages: LanguageWeight[];
  confidence: number;
  evidence: { reposConsidered: number; windowDays: number };
};

/** Recency weight: full influence for fresh repos, decaying inside the tech window. */
function recencyWeight(pushedAt: string, now: Date): number {
  const ageDays = (now.getTime() - new Date(pushedAt).getTime()) / 86_400_000;
  if (ageDays <= 30) return 1;
  if (ageDays >= TECH_WINDOW_DAYS) return 0.15;
  return 1 - (0.75 * (ageDays - 30)) / (TECH_WINDOW_DAYS - 30);
}

/**
 * Score the GitHub-visible stack. Forks/archived repos are excluded, each repo's
 * influence is capped at 1, and per-language totals are sqrt-normalized so one
 * giant monorepo can't dominate the pet's appearance.
 */
export function buildTechProfile(repos: RepoSignal[], now: Date): TechProfile {
  const considered = repos.filter(
    (repo) =>
      !repo.fork &&
      !repo.archived &&
      repo.language &&
      repo.name.toLowerCase() !== "gitpet",
  );

  const rawByLanguage = new Map<string, number>();
  for (const repo of considered) {
    const contribution = Math.min(1, recencyWeight(repo.pushedAt, now));
    const language = repo.language as string;
    rawByLanguage.set(language, (rawByLanguage.get(language) ?? 0) + contribution);
  }

  const sqrtWeights = [...rawByLanguage.entries()].map(([name, total]) => ({
    name,
    weight: Math.sqrt(total),
  }));
  const weightSum = sqrtWeights.reduce((sum, item) => sum + item.weight, 0);

  const languages: LanguageWeight[] = sqrtWeights
    .map(({ name, weight }) => ({
      name,
      weight: weightSum > 0 ? Number((weight / weightSum).toFixed(3)) : 0,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  const evidence = { reposConsidered: considered.length, windowDays: TECH_WINDOW_DAYS };

  if (languages.length === 0) {
    return { primaryArchetype: "unknown", languages: [], confidence: 0, evidence };
  }

  const scores: Record<Archetype, number> = { interface: 0, backend: 0, systems: 0, data: 0 };
  for (const { name, weight } of languages) {
    const mapping = LANGUAGE_MAP[name] ?? { backend: 0.5, systems: 0.5 };
    for (const archetype of ARCHETYPES) {
      scores[archetype] += weight * (mapping[archetype] ?? 0);
    }
  }

  const ranked = ARCHETYPES.map((archetype) => ({ archetype, score: scores[archetype] }))
    .sort((a, b) => b.score - a.score);
  const total = ranked.reduce((sum, item) => sum + item.score, 0) || 1;

  const [first, second, third] = ranked;
  const secondaryShare = second.score / total;
  const tertiaryShare = third.score / total;

  return {
    primaryArchetype: first.archetype,
    secondaryArchetype: secondaryShare >= 0.18 ? second.archetype : undefined,
    tertiaryArchetype: secondaryShare >= 0.18 && tertiaryShare >= 0.12 ? third.archetype : undefined,
    languages,
    confidence: Number((first.score / total).toFixed(2)),
    evidence,
  };
}
