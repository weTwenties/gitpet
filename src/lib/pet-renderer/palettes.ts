import type { Archetype, Lighting, Mood, Species } from "@/lib/pet-engine";

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

/** Strong species base colors (chibi sheet) — identity palette still tints lightly. */
const SPECIES_BIAS: Record<
  Species,
  { body: string; dark: string; light: string; accent: string; amount: number }
> = {
  cat: { body: "#f4efe6", dark: "#6b4a2e", light: "#fffaf3", accent: "#e8883a", amount: 0.72 },
  fox: { body: "#f08a3a", dark: "#b85a18", light: "#ffe8c8", accent: "#ffb0c0", amount: 0.78 },
  rabbit: { body: "#f2a0b8", dark: "#c46a84", light: "#ffd6e4", accent: "#ffc0d0", amount: 0.8 },
};

function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const to = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(ar + (br - ar) * t)}${to(ag + (bg - ag) * t)}${to(ab + (bb - ab) * t)}`;
}

/** Identity palette × species bias → fills that still feel unique per username. */
export function paletteForSpecies(base: PetPalette, species: Species): PetPalette {
  const bias = SPECIES_BIAS[species];
  const t = bias.amount;
  return {
    body: mixHex(base.body, bias.body, t),
    bodyDark: mixHex(base.bodyDark, bias.dark, t),
    bodyLight: mixHex(base.bodyLight, bias.light, t),
    accent: mixHex(base.accent, bias.accent, t),
  };
}

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
