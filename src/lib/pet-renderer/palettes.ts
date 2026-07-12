import type { Archetype, Lighting, Mood } from "@/lib/pet-engine";

/** Body palette roles used by the pixel maps. */
export type PetPalette = {
  body: string;
  bodyDark: string;
  bodyLight: string;
  accent: string;
};

export const PET_PALETTES: Record<string, PetPalette> = {
  amber: { body: "#f5b971", bodyDark: "#8a5a2e", bodyLight: "#ffe3bd", accent: "#ef8fb0" },
  slate: { body: "#9aa5b8", bodyDark: "#4b5568", bodyLight: "#dfe6f0", accent: "#f2a65a" },
  moss: { body: "#a3c585", bodyDark: "#55744a", bodyLight: "#e3f0d3", accent: "#e8a1c0" },
  rose: { body: "#e8a1b3", bodyDark: "#8f4f63", bodyLight: "#ffd9e2", accent: "#ffd166" },
  cocoa: { body: "#b48a68", bodyDark: "#6a4a33", bodyLight: "#ecd4bd", accent: "#8fd0c9" },
  mint: { body: "#8fd0b8", bodyDark: "#47775f", bodyLight: "#ddf3e8", accent: "#f7b2ad" },
};

/** Archetype accent colors drive outfit/workstation/effects, not the pet body. */
export const ARCHETYPE_COLORS: Record<Archetype | "unknown", string> = {
  interface: "#f472b6",
  backend: "#34d399",
  systems: "#f97316",
  data: "#38bdf8",
  unknown: "#9aa79e",
};

export const MOOD_AURA: Record<Mood, string> = {
  calm: "#7cd6a3",
  focused: "#7ab8ff",
  happy: "#ffd37a",
  sleepy: "#a99cf2",
  waiting: "#9fd0c3",
};

export const LIGHTING_SKY: Record<Lighting, { top: string; bottom: string; glow: string }> = {
  day: { top: "#8ec5ff", bottom: "#dff1ff", glow: "#fff6d8" },
  evening: { top: "#f7a37b", bottom: "#4d3f73", glow: "#ffd9a0" },
  night: { top: "#101d3a", bottom: "#1d2f52", glow: "#cfe3ff" },
};

export const ROOM_WALLS: Record<string, { wall: string; floor: string; rug: string }> = {
  "studio-loft": { wall: "#2a2440", floor: "#1c1830", rug: "#f472b6" },
  "server-den": { wall: "#15332a", floor: "#0e241d", rug: "#34d399" },
  workshop: { wall: "#3a2a1c", floor: "#281c12", rug: "#f97316" },
  observatory: { wall: "#152a44", floor: "#0e1d30", rug: "#38bdf8" },
  "cozy-corner": { wall: "#2a2a2a", floor: "#1c1c1c", rug: "#9aa79e" },
};
