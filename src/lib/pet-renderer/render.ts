import type { GitPetProfile } from "@/lib/pet-engine";
import {
  ARCHETYPE_COLORS,
  LIGHTING_SKY,
  MOOD_AURA,
  PET_PALETTES,
  ROOM_WALLS,
  type PetPalette,
} from "./palettes";
import {
  ACCESSORY_OVERLAYS,
  EYE_CELLS,
  GRID,
  OUTFIT_OVERLAYS,
  SPECIES_SPRITES,
  type OverlayRect,
} from "./sprites";

/**
 * String-based SVG renderer. Pure functions with zero framework dependency so
 * the exact same output feeds:
 *   1. the /:username web scene (inline SVG)
 *   2. /api/card/:username (README embed)
 *   3. the landing demo pet
 */

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paletteOf(profile: GitPetProfile): PetPalette {
  return PET_PALETTES[profile.identity.palette] ?? PET_PALETTES.amber;
}

function archetypeColor(profile: GitPetProfile): string {
  return ARCHETYPE_COLORS[profile.tech.primaryArchetype] ?? ARCHETYPE_COLORS.unknown;
}

function secondaryColor(profile: GitPetProfile): string {
  return profile.tech.secondaryArchetype
    ? ARCHETYPE_COLORS[profile.tech.secondaryArchetype]
    : archetypeColor(profile);
}

function overlayFill(
  role: OverlayRect["role"],
  palette: PetPalette,
  accent: string,
): string {
  switch (role) {
    case "archetype":
      return accent;
    case "archetypeDark":
      return palette.bodyDark;
    case "white":
      return "#f5f7f2";
    case "bodyDark":
      return palette.bodyDark;
  }
}

function rect(x: number, y: number, w: number, h: number, fill: string, extra = ""): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
}

/** Draw a pixel map as row-merged rects (fewer nodes than one rect per cell). */
function drawPixelMap(map: string[], cell: number, fills: Record<string, string>): string {
  const parts: string[] = [];
  for (let row = 0; row < map.length; row++) {
    const line = map[row];
    let col = 0;
    while (col < line.length) {
      const ch = line[col];
      if (ch === "." || !fills[ch]) {
        col++;
        continue;
      }
      let end = col;
      while (end + 1 < line.length && line[end + 1] === ch) end++;
      parts.push(rect(col * cell, row * cell, (end - col + 1) * cell, cell, fills[ch]));
      col = end + 1;
    }
  }
  return parts.join("");
}

function drawOverlays(overlays: OverlayRect[], cell: number, palette: PetPalette, accent: string): string {
  return overlays
    .map((o) => rect(o.x * cell, o.y * cell, o.w * cell, o.h * cell, overlayFill(o.role, palette, accent)))
    .join("");
}

/** Eyes-closed lids (body-colored) — permanently on while resting, blink otherwise. */
function drawEyelids(profile: GitPetProfile, cell: number, palette: PetPalette): string {
  const resting = profile.state.action === "resting";
  const cells = EYE_CELLS[profile.identity.species];
  const lids = cells
    .map(([x, y]) => rect(x * cell, y * cell, cell, cell, palette.body))
    .join("");
  return `<g class="${resting ? "lids-closed" : "lids-blink"}">${lids}</g>`;
}

/** Eye highlight for the "spark" face variant. */
function drawEyeSpark(profile: GitPetProfile, cell: number): string {
  if (profile.identity.faceVariant !== "spark") return "";
  const cells = EYE_CELLS[profile.identity.species];
  return cells
    .map(([x, y]) => rect(x * cell + cell / 2, y * cell, cell / 2, cell / 2, "#ffffff"))
    .join("");
}

/** Ambient effect pixels from the tertiary archetype. */
function drawEffect(profile: GitPetProfile, cell: number): string {
  if (!profile.appearance.effect) return "";
  const color = profile.tech.tertiaryArchetype
    ? ARCHETYPE_COLORS[profile.tech.tertiaryArchetype]
    : secondaryColor(profile);
  const size = Math.max(2, cell / 2);
  const spots: Array<[number, number]> = [
    [-1.5, 3],
    [16.5, 5],
    [-1, 10],
    [16.8, 11.5],
  ];
  return spots
    .map(([gx, gy], i) =>
      rect(gx * cell, gy * cell, size, size, color, `class="fx fx-${i}" opacity="0.85"`),
    )
    .join("");
}

/** Zzz pixels while resting, confetti while celebrating. */
function drawActionExtras(profile: GitPetProfile, cell: number): string {
  if (profile.state.action === "resting") {
    const c = "#cfe3ff";
    return [
      rect(13.4 * cell, 1.6 * cell, cell * 0.9, cell * 0.35, c, `class="fx fx-0"`),
      rect(14.4 * cell, 0.7 * cell, cell * 0.7, cell * 0.3, c, `class="fx fx-1"`),
      rect(15.2 * cell, 0, cell * 0.5, cell * 0.25, c, `class="fx fx-2"`),
    ].join("");
  }
  if (profile.state.action === "celebrating") {
    const colors = ["#ffd37a", "#f472b6", "#7cf59a", "#38bdf8"];
    const spots: Array<[number, number]> = [
      [0.5, 0.5],
      [14.5, 1.2],
      [1.5, 5.5],
      [15, 6.5],
    ];
    return spots
      .map(([gx, gy], i) =>
        rect(gx * cell, gy * cell, cell * 0.55, cell * 0.55, colors[i % colors.length], `class="fx fx-${i}"`),
      )
      .join("");
  }
  return "";
}

const MOOD_BOB_SECONDS: Record<GitPetProfile["state"]["mood"], number> = {
  happy: 1.6,
  focused: 2.4,
  waiting: 2.8,
  calm: 3.2,
  sleepy: 5,
};

/** Shared <style> (animations, reduced-motion). */
export function petStyles(profile: GitPetProfile): string {
  const bob = MOOD_BOB_SECONDS[profile.state.mood];
  return `
  .pet-bob { animation: gp-bob ${bob}s ease-in-out infinite; }
  .lids-blink rect { opacity: 0; animation: gp-blink 4.4s steps(1) infinite; }
  .lids-closed rect { opacity: 1; }
  .fx { animation: gp-float 2.6s ease-in-out infinite; }
  .fx-1 { animation-delay: .5s; } .fx-2 { animation-delay: 1s; } .fx-3 { animation-delay: 1.5s; }
  .aura { animation: gp-pulse 3.4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
  @keyframes gp-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
  @keyframes gp-blink { 0%, 92% { opacity: 0; } 93%, 97% { opacity: 1; } 98%, 100% { opacity: 0; } }
  @keyframes gp-float { 0%,100% { transform: translateY(0); opacity: .9; } 50% { transform: translateY(-4px); opacity: .5; } }
  @keyframes gp-pulse { 0%,100% { opacity: .28; transform: scale(1); } 50% { opacity: .5; transform: scale(1.06); } }
  @media (prefers-reduced-motion: reduce) {
    .pet-bob, .lids-blink rect, .fx, .aura { animation: none; }
  }`;
}

/**
 * The pet as an SVG group, GRID*cell wide/tall, positioned by the caller.
 * Single source of truth reused by scene, card and standalone renders.
 */
export function renderPetGroup(profile: GitPetProfile, cell: number): string {
  const palette = paletteOf(profile);
  const fills: Record<string, string> = {
    B: palette.body,
    D: palette.bodyDark,
    L: palette.bodyLight,
    A: palette.accent,
    E: "#131a16",
    N: "#131a16",
  };
  const map = SPECIES_SPRITES[profile.identity.species];
  const aura = MOOD_AURA[profile.state.mood];
  const size = GRID * cell;

  const outfit = OUTFIT_OVERLAYS[profile.appearance.outfit] ?? [];
  const accessory = profile.appearance.accessory
    ? ACCESSORY_OVERLAYS[profile.appearance.accessory] ?? []
    : [];

  return `
  <g class="pet-bob">
    <ellipse class="aura" cx="${size / 2}" cy="${size * 0.62}" rx="${size * 0.58}" ry="${size * 0.5}" fill="${aura}"/>
    ${drawPixelMap(map, cell, fills)}
    ${drawOverlays(outfit, cell, palette, archetypeColor(profile))}
    ${drawEyelids(profile, cell, palette)}
    ${drawEyeSpark(profile, cell)}
    ${drawOverlays(accessory, cell, palette, secondaryColor(profile))}
    ${drawEffect(profile, cell)}
    ${drawActionExtras(profile, cell)}
  </g>`;
}

/** Standalone pet SVG (landing demo, avatars). */
export function renderPetSvg(profile: GitPetProfile, sizePx = 192): string {
  const cell = Math.floor(sizePx / GRID);
  const size = GRID * cell;
  const label = `${profile.identity.name}, a pixel ${profile.identity.species}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeXml(label)}" shape-rendering="crispEdges">
  <style>${petStyles(profile)}</style>
  ${renderPetGroup(profile, cell)}
</svg>`;
}

/** Workstation prop drawn on the desk, keyed by fusion result. */
function drawWorkstation(profile: GitPetProfile, x: number, y: number): string {
  const color = archetypeColor(profile);
  switch (profile.appearance.workstation) {
    case "dual-monitor":
      return [
        rect(x, y - 26, 30, 20, "#131a16", `rx="2"`),
        rect(x + 2, y - 24, 26, 16, color, `opacity="0.85"`),
        rect(x + 34, y - 22, 24, 16, "#131a16", `rx="2"`),
        rect(x + 36, y - 20, 20, 12, color, `opacity="0.6"`),
      ].join("");
    case "terminal-rig":
      return [
        rect(x, y - 26, 34, 22, "#131a16", `rx="2"`),
        rect(x + 3, y - 23, 22, 3, color),
        rect(x + 3, y - 17, 16, 3, color, `opacity="0.7"`),
        rect(x + 3, y - 11, 26, 3, color, `opacity="0.45"`),
      ].join("");
    case "workbench":
      return [
        rect(x, y - 12, 34, 8, "#4a3625"),
        rect(x + 4, y - 20, 5, 10, color),
        rect(x + 14, y - 17, 12, 4, "#9aa5b8"),
        rect(x + 30, y - 22, 4, 12, color, `opacity="0.8"`),
      ].join("");
    case "chart-station":
      return [
        rect(x, y - 30, 36, 24, "#131a16", `rx="2"`),
        rect(x + 4, y - 14, 5, 6, color),
        rect(x + 12, y - 20, 5, 12, color, `opacity="0.8"`),
        rect(x + 20, y - 24, 5, 16, color, `opacity="0.6"`),
        rect(x + 28, y - 17, 5, 9, color, `opacity="0.9"`),
      ].join("");
    default:
      return rect(x + 6, y - 16, 22, 12, "#131a16", `rx="2"`);
  }
}

export type SceneOptions = { width?: number; height?: number };

/** Full-room scene: wall/floor by room theme, window lighting, desk + workstation, pet. */
export function renderSceneSvg(profile: GitPetProfile, options: SceneOptions = {}): string {
  const width = options.width ?? 480;
  const height = options.height ?? 360;
  const room = ROOM_WALLS[profile.appearance.roomTheme] ?? ROOM_WALLS["cozy-corner"];
  const sky = LIGHTING_SKY[profile.state.lighting];

  const cell = 12;
  const petSize = GRID * cell;
  // Pet stands center-left; desk and workstation live on the right so they never overlap.
  const petX = width * 0.36 - petSize / 2;
  const floorY = height * 0.72;
  const petY = floorY - petSize + 14;

  const deskX = width * 0.68;
  const working = profile.state.action === "working";

  const label = `${profile.identity.name} the ${profile.identity.species}, ${profile.state.mood} and ${profile.state.action}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}" shape-rendering="crispEdges">
  <style>${petStyles(profile)}</style>
  ${rect(0, 0, width, floorY, room.wall)}
  ${rect(0, floorY, width, height - floorY, room.floor)}
  <g>
    ${rect(width * 0.12, height * 0.12, 92, 76, "#131a16")}
    ${rect(width * 0.12 + 4, height * 0.12 + 4, 84, 68, sky.top)}
    ${rect(width * 0.12 + 4, height * 0.12 + 38, 84, 34, sky.bottom)}
    ${rect(width * 0.12 + 62, height * 0.12 + 12, 12, 12, sky.glow, `rx="6"`)}
    ${rect(width * 0.12 + 42, height * 0.12, 6, 76, "#131a16")}
  </g>
  ${rect(width * 0.62, floorY - 34, width * 0.32, 8, "#4a3625")}
  ${rect(width * 0.64, floorY - 26, 8, 26, "#33251a")}
  ${rect(width * 0.9, floorY - 26, 8, 26, "#33251a")}
  ${drawWorkstation(profile, deskX, floorY - 34)}
  ${rect(width * 0.16, floorY + 16, width * 0.42, 14, room.rug, `opacity="0.35" rx="7"`)}
  <g transform="translate(${working ? petX + 24 : petX}, ${petY})">
    ${renderPetGroup(profile, cell)}
  </g>
</svg>`;
}
