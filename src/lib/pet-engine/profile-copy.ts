import type {
  ActivityBand,
  ArchetypeOrUnknown,
  GitPetProfile,
  Mood,
  PetAction,
  Personality,
} from "./schema";

/** Human-readable copy for the /:username dossier. Pure — no React. */

export const ARCHETYPE_LABELS: Record<ArchetypeOrUnknown, string> = {
  interface: "Interface crafter",
  backend: "Backend keeper",
  systems: "Systems tinkerer",
  data: "Data stargazer",
  unknown: "New explorer",
};

export const ARCHETYPE_BLURBS: Record<ArchetypeOrUnknown, string> = {
  interface: "Public repos lean toward UI, frontend, and product surfaces.",
  backend: "Public repos lean toward services, APIs, and server-side craft.",
  systems: "Public repos lean toward tooling, infra, and low-level work.",
  data: "Public repos lean toward analysis, notebooks, and signal work.",
  unknown: "Not enough public language signal yet — still finding its desk.",
};

const BAND_META: Record<
  ActivityBand,
  { label: string; rank: string; blurb: string }
> = {
  none: {
    label: "Quiet week",
    rank: "DORMANT",
    blurb: "Little public activity this window — the pet is conserving energy.",
  },
  light: {
    label: "Light week",
    rank: "LIGHT",
    blurb: "A few public signals — enough to keep the habitat awake.",
  },
  active: {
    label: "Active week",
    rank: "ACTIVE",
    blurb: "Steady public shipping — the desk is warm and the pet is present.",
  },
  intense: {
    label: "Intense week",
    rank: "INTENSE",
    blurb: "Heavy recent public output — the habitat is running hot.",
  },
};

const MOOD_BLURBS: Record<Mood, string> = {
  calm: "Settled breathing, soft aura — nothing urgent on the desk.",
  focused: "Eyes on the work — the room tightens around the task.",
  happy: "Bright bounce — recent public wins still linger in the air.",
  sleepy: "Heavy lids — low activity left the habitat dim and quiet.",
  waiting: "Poised between commits — watching the window for the next push.",
};

const ACTION_BLURBS: Record<PetAction, string> = {
  idle: "Wandering the rug, checking the window light.",
  working: "Pulled up to the workstation — mirroring your recent public grind.",
  resting: "Collapsed into a nap after a thin activity window.",
  celebrating: "Tiny confetti weather — something public just landed well.",
};

const PERSONALITY_BLURBS: Record<Personality, string> = {
  curious: "Pokes every new repo signal like a new toy.",
  steady: "Keeps a reliable rhythm even when the week is quiet.",
  playful: "Turns routine pushes into little celebrations.",
  quiet: "Prefers soft presence — watches more than it performs.",
};

const OUTFIT_LABELS: Record<string, string> = {
  "studio-hoodie": "Studio hoodie",
  "field-apron": "Field apron",
  "utility-vest": "Utility vest",
  "observatory-coat": "Observatory coat",
  "plain-scarf": "Plain scarf",
};

const WORKSTATION_LABELS: Record<string, string> = {
  "dual-monitor": "Dual monitor",
  "terminal-rig": "Terminal rig",
  workbench: "Workbench",
  "chart-station": "Chart station",
  "simple-desk": "Simple desk",
};

const ROOM_LABELS: Record<string, string> = {
  "studio-loft": "Studio loft",
  "server-den": "Server den",
  workshop: "Workshop",
  observatory: "Observatory",
  "cozy-corner": "Cozy corner",
};

const ACCESSORY_LABELS: Record<string, string> = {
  "design-tablet": "Design tablet",
  "coffee-mug": "Coffee mug",
  wrench: "Wrench",
  "chart-card": "Chart card",
};

const EFFECT_LABELS: Record<string, string> = {
  "pixel-sparkles": "Pixel sparkles",
  "steam-wisps": "Steam wisps",
  "ember-dots": "Ember dots",
  "data-motes": "Data motes",
};

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function labelMap(map: Record<string, string>, key: string): string {
  return map[key] ?? titleCase(key);
}

export type ProfileDossier = {
  archetypeLabel: string;
  archetypeBlurb: string;
  band: (typeof BAND_META)[ActivityBand];
  moodBlurb: string;
  actionBlurb: string;
  personalityBlurb: string;
  stateLine: string;
  confidencePct: number;
  languages: Array<{ name: string; pct: number }>;
  habitat: Array<{ slot: string; value: string }>;
  care: Array<{ label: string; value: string; hint: string }>;
  identityBits: Array<{ label: string; value: string }>;
};

export function buildProfileDossier(profile: GitPetProfile): ProfileDossier {
  const primary = profile.tech.primaryArchetype;
  const habitat: ProfileDossier["habitat"] = [
    { slot: "Room", value: labelMap(ROOM_LABELS, profile.appearance.roomTheme) },
    { slot: "Outfit", value: labelMap(OUTFIT_LABELS, profile.appearance.outfit) },
    { slot: "Desk", value: labelMap(WORKSTATION_LABELS, profile.appearance.workstation) },
  ];
  if (profile.appearance.accessory) {
    habitat.push({
      slot: "Held",
      value: labelMap(ACCESSORY_LABELS, profile.appearance.accessory),
    });
  }
  if (profile.appearance.effect) {
    habitat.push({
      slot: "Aura FX",
      value: labelMap(EFFECT_LABELS, profile.appearance.effect),
    });
  }

  return {
    archetypeLabel: ARCHETYPE_LABELS[primary] ?? "Explorer",
    archetypeBlurb: ARCHETYPE_BLURBS[primary] ?? ARCHETYPE_BLURBS.unknown,
    band: BAND_META[profile.state.band],
    moodBlurb: MOOD_BLURBS[profile.state.mood],
    actionBlurb: ACTION_BLURBS[profile.state.action],
    personalityBlurb: PERSONALITY_BLURBS[profile.identity.personality],
    stateLine: `${profile.state.mood} · ${profile.state.action} · ${profile.state.lighting}`,
    confidencePct: Math.round(profile.tech.confidence * 100),
    languages: profile.tech.languages.slice(0, 5).map((language) => ({
      name: language.name,
      pct: Math.max(4, Math.round(language.weight * 100)),
    })),
    habitat,
    care: [
      {
        label: "Active days",
        value: String(profile.state.activeDays),
        hint: "Days with public events in the activity window",
      },
      {
        label: "Pull requests",
        value: String(profile.state.pullRequests),
        hint: "Public PR events counted toward this pet’s week",
      },
      {
        label: "Reviews",
        value: String(profile.state.reviews),
        hint: "Public review events that shaped today’s mood",
      },
    ],
    identityBits: [
      { label: "Species", value: profile.identity.species },
      { label: "Body", value: profile.identity.bodyVariant },
      { label: "Face", value: profile.identity.faceVariant },
      { label: "Palette", value: profile.identity.palette },
      { label: "Personality", value: profile.identity.personality },
    ],
  };
}
