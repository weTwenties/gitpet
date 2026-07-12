import { createRng, pick } from "./hash";
import type { ActivitySignals, Lighting, Mood, PetAction } from "./schema";

export type PetState = {
  band: ActivitySignals["band"];
  mood: Mood;
  action: PetAction;
  lighting: Lighting;
  activeDays: number;
  pullRequests: number;
  reviews: number;
};

/**
 * Daily state (roadmap Phase 6). Deterministic for the same data window:
 * tie-breaks are seeded with username + date + band, never Math.random.
 * Inactivity is never punished — the pet just rests.
 */
export function buildState(username: string, activity: ActivitySignals, now: Date): PetState {
  const dateKey = now.toISOString().slice(0, 10);
  const rng = createRng(`state:${username.toLowerCase()}:${dateKey}:${activity.band}`);

  let mood: Mood;
  let action: PetAction;

  if (activity.recentRelease) {
    mood = "happy";
    action = "celebrating";
  } else {
    switch (activity.band) {
      case "none":
        action = pick(rng, ["resting", "idle"] as const);
        mood = action === "resting" ? "sleepy" : "calm";
        break;
      case "light":
        action = "idle";
        mood = pick(rng, ["waiting", "calm"] as const);
        break;
      case "active":
        action = "working";
        mood = "focused";
        break;
      case "intense":
        action = "working";
        mood = pick(rng, ["focused", "happy"] as const);
        break;
    }
  }

  const hour = now.getUTCHours();
  const lighting: Lighting = hour >= 6 && hour < 17 ? "day" : hour < 21 ? "evening" : "night";

  return {
    band: activity.band,
    mood,
    action,
    lighting,
    activeDays: activity.activeDays,
    pullRequests: activity.pullRequests,
    reviews: activity.reviews,
  };
}
