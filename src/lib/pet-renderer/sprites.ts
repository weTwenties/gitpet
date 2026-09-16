import type { Species } from "@/lib/pet-engine";

/**
 * Pixel maps: 16×16 grids, one char per cell.
 *   .  empty
 *   B  body (main fill)
 *   D  darker patch / shade
 *   L  light / white face patch
 *   A  accent (inner ear, second coat color, beak, mane)
 *   P  pink cheek blush (fixed cute pink)
 *   E  eye
 *   N  nose / mouth
 *
 * Style: chibi kawaii pixel pets (reference sheet) —
 * big round head, tiny stub body, no heavy outline ring,
 * 2×2 eyes, pink cheek dots, silhouette from ears/features.
 */
export const GRID = 16;

/** Calico: white face, dark left ear, orange right ear, blush. */
const CAT: string[] = [
  "................",
  "...D........A...",
  "..DDD......AAA..",
  "..DLD......ALA..",
  "...LLLLLLLLLL...",
  "..LLLLLLLLLLLL..",
  "..LLEELLLLEELL..",
  "..LLEELLLLEELL..",
  "..LLLPLLLPLLLL..",
  "..LLLLLNNLLLLL..",
  "...LLLLLLLLLL...",
  ".....BBBBBB.....",
  ".....BBBBBB.....",
  "......B..B......",
  "................",
  "................",
];

/** Bright fox: tall triangles, white muzzle, bushy tail stub. */
const FOX: string[] = [
  "................",
  ".D............D.",
  ".DD..........DD.",
  ".DAD........DAD.",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBEELBBBBLEEBB.",
  ".BBEELBBBBLEEBB.",
  ".BBBPBBLLBBPBBB.",
  ".BBBBBLNNLBBBBB.",
  "..BBBBBLLBBBBB..",
  "D....BBBBBB.....",
  "DD...BBBBBB.....",
  "DDD...B..B......",
  "................",
  "................",
];

/** Tall pink ears, tiny body, cotton-tail accent. */
const RABBIT: string[] = [
  "................",
  "..A..........A..",
  "..AA........AA..",
  "..AA........AA..",
  "..ABA......ABA..",
  "...BBBBBBBBBB...",
  "..BBEEBBBBEEBB..",
  "..BBEEBBBBEEBB..",
  "..BBBPBBBBPBBB..",
  "..BBBBBNNBBBB...",
  "...BBBBBBBBBB...",
  ".....BBBBBB.....",
  ".....BBBBBB..A..",
  "......B..B..A...",
  "................",
  "................",
];

export const SPECIES_SPRITES: Record<Species, string[]> = {
  cat: CAT,
  fox: FOX,
  rabbit: RABBIT,
};

function collectEyes(map: string[]): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === "E") cells.push([x, y]);
    });
  });
  return cells;
}

/** Eye cell positions (col, row) for blink/sleep overlays — derived from maps. */
export const EYE_CELLS: Record<Species, Array<[number, number]>> = {
  cat: collectEyes(CAT),
  fox: collectEyes(FOX),
  rabbit: collectEyes(RABBIT),
};

/** A rectangle in grid coordinates with a palette role. */
export type OverlayRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  role: "archetype" | "archetypeDark" | "white" | "bodyDark";
};

/** Tiny neck scarf — never a chest slab over the chibi body. */
export const OUTFIT_OVERLAYS: Record<string, OverlayRect[]> = {
  "studio-hoodie": [{ x: 5, y: 11, w: 6, h: 1, role: "archetype" }],
  "field-apron": [
    { x: 5, y: 11, w: 6, h: 1, role: "archetype" },
    { x: 6, y: 12, w: 4, h: 1, role: "archetypeDark" },
  ],
  "utility-vest": [
    { x: 4, y: 11, w: 2, h: 2, role: "archetype" },
    { x: 10, y: 11, w: 2, h: 2, role: "archetype" },
  ],
  "observatory-coat": [
    { x: 4, y: 11, w: 2, h: 2, role: "archetype" },
    { x: 10, y: 11, w: 2, h: 2, role: "archetype" },
  ],
  "plain-scarf": [{ x: 5, y: 11, w: 6, h: 1, role: "archetype" }],
};

/** Handheld accessories beside the right paw. */
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
