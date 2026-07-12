import type { Species } from "@/lib/pet-engine";

/**
 * Pixel maps: 16×16 grids, one char per cell.
 *   .  empty        B  body        D  body dark (outline/shade)
 *   L  body light   A  accent (inner ear)
 *   E  eye          N  nose
 * The same maps feed the web scene, the README card and the landing demo.
 */
export const GRID = 16;

const CAT: string[] = [
  "................",
  ".DD..........DD.",
  ".DAD........DAD.",
  ".DBAD......DABD.",
  ".DBBDDDDDDDDBBD.",
  ".DBBBBBBBBBBBBD.",
  ".DBBBBBBBBBBBBD.",
  ".DBEBBBBBBBBEBD.",
  ".DBBBBBNNBBBBBD.",
  "..DBBBBBBBBBBD..",
  "..DBLLLLLLLLBD..",
  ".DBBLLLLLLLLBBD.",
  ".DBBBLLLLLLBBBD.",
  ".DBBBBBBBBBBBBD.",
  "..DBBD.DD.DBBD..",
  "..DDD......DDD..",
];

const FOX: string[] = [
  ".DD..........DD.",
  ".DAD........DAD.",
  ".DAAD......DAAD.",
  ".DBAAD....DAABD.",
  ".DBBADDDDDDABBD.",
  "DDBBBBBBBBBBBBDD",
  "DBBBBBBBBBBBBBBD",
  "DBBEBBBBBBBBEBBD",
  "DBBBBBLNNLBBBBBD",
  ".DBBLLLLLLLLBBD.",
  ".DBLLLLLLLLLLBD.",
  "..DBLLLLLLLLBD..",
  "..DBBBBBBBBBBD..",
  ".DBBBBBBBBBBBBD.",
  "..DBBD.DD.DBBD..",
  "..DDD......DDD..",
];

const RABBIT: string[] = [
  "...DAD....DAD...",
  "...DAD....DAD...",
  "...DAAD..DAAD...",
  "...DBAD..DABD...",
  "...DBBD..DBBD...",
  "..DBBBDDDDBBBD..",
  ".DBBBBBBBBBBBBD.",
  ".DBEBBBBBBBBEBD.",
  ".DBBBBBNNBBBBBD.",
  "..DBBBBBBBBBBD..",
  "..DBLLLLLLLLBD..",
  ".DBBLLLLLLLLBBD.",
  ".DBBBLLLLLLBBBD.",
  ".DBBBBBBBBBBBBD.",
  "..DBBD.DD.DBBD..",
  "..DDD......DDD..",
];

export const SPECIES_SPRITES: Record<Species, string[]> = {
  cat: CAT,
  fox: FOX,
  rabbit: RABBIT,
};

/** Eye cell positions per species (col, row), used for blink/sleep overlays. */
export const EYE_CELLS: Record<Species, Array<[number, number]>> = {
  cat: [
    [3, 7],
    [12, 7],
  ],
  fox: [
    [3, 7],
    [12, 7],
  ],
  rabbit: [
    [3, 7],
    [12, 7],
  ],
};

/** A rectangle in grid coordinates with a palette role. */
export type OverlayRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  role: "archetype" | "archetypeDark" | "white" | "bodyDark";
};

/**
 * Outfits are overlays on the chest/neck rows so every species can wear every
 * outfit — this is what makes fusion combinatorial instead of hand-drawn.
 */
export const OUTFIT_OVERLAYS: Record<string, OverlayRect[]> = {
  "studio-hoodie": [
    { x: 2, y: 12, w: 12, h: 1, role: "archetype" },
    { x: 3, y: 13, w: 2, h: 1, role: "archetype" },
    { x: 11, y: 13, w: 2, h: 1, role: "archetype" },
  ],
  "field-apron": [
    { x: 5, y: 12, w: 6, h: 2, role: "archetype" },
    { x: 6, y: 11, w: 4, h: 1, role: "archetypeDark" },
  ],
  "utility-vest": [
    { x: 2, y: 11, w: 2, h: 3, role: "archetype" },
    { x: 12, y: 11, w: 2, h: 3, role: "archetype" },
    { x: 3, y: 12, w: 1, h: 1, role: "white" },
    { x: 12, y: 12, w: 1, h: 1, role: "white" },
  ],
  "observatory-coat": [
    { x: 2, y: 11, w: 2, h: 3, role: "archetype" },
    { x: 12, y: 11, w: 2, h: 3, role: "archetype" },
    { x: 7, y: 13, w: 2, h: 1, role: "archetypeDark" },
  ],
  "plain-scarf": [{ x: 3, y: 12, w: 10, h: 1, role: "archetype" }],
};

/** Handheld accessories rendered beside the right paw (grid coords, can exceed the body box). */
export const ACCESSORY_OVERLAYS: Record<string, OverlayRect[]> = {
  "design-tablet": [
    { x: 13, y: 12, w: 3, h: 2, role: "archetype" },
    { x: 14, y: 12, w: 1, h: 1, role: "white" },
  ],
  "coffee-mug": [
    { x: 13, y: 12, w: 2, h: 2, role: "archetype" },
    { x: 15, y: 12, w: 1, h: 1, role: "archetypeDark" },
  ],
  wrench: [
    { x: 13, y: 12, w: 1, h: 3, role: "archetype" },
    { x: 14, y: 12, w: 1, h: 1, role: "archetype" },
  ],
  "chart-card": [
    { x: 13, y: 11, w: 3, h: 3, role: "white" },
    { x: 14, y: 12, w: 1, h: 1, role: "archetype" },
  ],
};
