import { z } from "zod";

/** Versioned PetProfile contract (roadmap Phase 7). */

export const SPECIES = ["cat", "fox", "rabbit"] as const;
export const BODY_VARIANTS = ["round", "slim", "fluffy"] as const;
export const FACE_VARIANTS = ["bright", "sleepy", "spark"] as const;
export const PERSONALITIES = ["curious", "steady", "playful", "quiet"] as const;

export const ARCHETYPES = ["interface", "backend", "systems", "data"] as const;
/** "unknown" covers profiles with no readable public language signal. */
export const ARCHETYPE_OR_UNKNOWN = [...ARCHETYPES, "unknown"] as const;

export const ACTIVITY_BANDS = ["none", "light", "active", "intense"] as const;
export const MOODS = ["calm", "focused", "happy", "sleepy", "waiting"] as const;
export const ACTIONS = ["idle", "working", "resting", "celebrating"] as const;
export const LIGHTINGS = ["day", "evening", "night"] as const;

export type Species = (typeof SPECIES)[number];
export type BodyVariant = (typeof BODY_VARIANTS)[number];
export type FaceVariant = (typeof FACE_VARIANTS)[number];
export type Personality = (typeof PERSONALITIES)[number];
export type Archetype = (typeof ARCHETYPES)[number];
export type ArchetypeOrUnknown = (typeof ARCHETYPE_OR_UNKNOWN)[number];
export type ActivityBand = (typeof ACTIVITY_BANDS)[number];
export type Mood = (typeof MOODS)[number];
export type PetAction = (typeof ACTIONS)[number];
export type Lighting = (typeof LIGHTINGS)[number];

export const gitPetProfileSchema = z.object({
  username: z.string(),
  generatedAt: z.string(),
  lastSyncedAt: z.string(),

  source: z.object({
    visibility: z.literal("public"),
    label: z.literal("Based on public GitHub activity"),
  }),

  identity: z.object({
    identityVersion: z.number(),
    seed: z.string(),
    name: z.string(),
    species: z.enum(SPECIES),
    bodyVariant: z.enum(BODY_VARIANTS),
    faceVariant: z.enum(FACE_VARIANTS),
    personality: z.enum(PERSONALITIES),
    palette: z.string(),
  }),

  tech: z.object({
    fusionVersion: z.number(),
    primaryArchetype: z.enum(ARCHETYPE_OR_UNKNOWN),
    secondaryArchetype: z.enum(ARCHETYPES).optional(),
    tertiaryArchetype: z.enum(ARCHETYPES).optional(),
    languages: z.array(z.object({ name: z.string(), weight: z.number() })),
    confidence: z.number().min(0).max(1),
    evidence: z.object({
      reposConsidered: z.number(),
      windowDays: z.number(),
    }),
  }),

  appearance: z.object({
    assetVersion: z.number(),
    traits: z.array(z.string()),
    outfit: z.string(),
    workstation: z.string(),
    roomTheme: z.string(),
    accessory: z.string().optional(),
    effect: z.string().optional(),
  }),

  state: z.object({
    band: z.enum(ACTIVITY_BANDS),
    mood: z.enum(MOODS),
    action: z.enum(ACTIONS),
    lighting: z.enum(LIGHTINGS),
    activeDays: z.number(),
    pullRequests: z.number(),
    reviews: z.number(),
  }),
});

export type GitPetProfile = z.infer<typeof gitPetProfileSchema>;

/** Normalized inputs the engine consumes. Fixtures and the GitHub collector both produce this. */
export type RepoSignal = {
  name: string;
  language: string | null;
  pushedAt: string;
  fork: boolean;
  archived: boolean;
};

export type ActivitySignals = {
  band: ActivityBand;
  activeDays: number;
  pushes: number;
  pullRequests: number;
  reviews: number;
  recentRelease: boolean;
  /** ISO date (YYYY-MM-DD) of the newest event — part of the daily-state seed. */
  latestEventDate: string | null;
};

export type PetEngineInput = {
  username: string;
  repos: RepoSignal[];
  activity: ActivitySignals;
  /** Fetch timestamp. Defaults to now. */
  syncedAt?: Date;
};
