import type { GitPetProfile } from "@/lib/pet-engine";
import { ARCHETYPE_COLORS, MOOD_AURA } from "./palettes";
import { escapeXml, petStyles, renderPetGroup } from "./render";
import { GRID } from "./sprites";

/**
 * README-embeddable card. GitHub renders SVGs with inline CSS animation,
 * so the pet stays alive inside a profile README:
 *   ![GitPet](https://gitpet.com/api/card/<username>)
 */

const WIDTH = 420;
const HEIGHT = 180;

const ARCHETYPE_LABELS: Record<string, string> = {
  interface: "Interface crafter",
  backend: "Backend keeper",
  systems: "Systems tinkerer",
  data: "Data stargazer",
  unknown: "New explorer",
};

function chip(x: number, label: string, color: string): string {
  const width = label.length * 6.2 + 16;
  return `
    <g transform="translate(${x}, 128)">
      <rect width="${width}" height="20" rx="10" fill="${color}" opacity="0.14"/>
      <rect width="${width}" height="20" rx="10" fill="none" stroke="${color}" stroke-opacity="0.45"/>
      <text x="${width / 2}" y="14" text-anchor="middle" font-size="10" fill="${color}">${escapeXml(label)}</text>
    </g>`;
}

export function renderCardSvg(profile: GitPetProfile): { svg: string; width: number; height: number } {
  const cell = 8;
  const petSize = GRID * cell;
  const accent = ARCHETYPE_COLORS[profile.tech.primaryArchetype] ?? ARCHETYPE_COLORS.unknown;
  const aura = MOOD_AURA[profile.state.mood];

  const archetypeLabel = ARCHETYPE_LABELS[profile.tech.primaryArchetype] ?? "Explorer";
  const topLanguages = profile.tech.languages.slice(0, 3).map((l) => l.name);
  const stateLine = `${profile.state.mood} · ${profile.state.action}`;

  let chipX = 156;
  const chips = topLanguages
    .map((name) => {
      const markup = chip(chipX, name, accent);
      chipX += name.length * 6.2 + 24;
      return markup;
    })
    .join("");

  const label = `${profile.identity.name}, @${profile.username}'s GitPet`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(label)}" font-family="'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif">
  <style>${petStyles(profile)}</style>
  <rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="#0c1913"/>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="12" fill="none" stroke="#20352a"/>
  <circle cx="76" cy="${HEIGHT / 2 + 8}" r="58" fill="${aura}" opacity="0.12"/>
  <g transform="translate(${76 - petSize / 2}, ${HEIGHT / 2 + 8 - petSize / 2})" shape-rendering="crispEdges">
    ${renderPetGroup(profile, cell)}
  </g>
  <text x="156" y="38" font-size="17" font-weight="700" fill="#f5f7f2">${escapeXml(profile.identity.name)}</text>
  <text x="156" y="58" font-size="11" fill="#9aa79e">@${escapeXml(profile.username)} · ${escapeXml(profile.identity.species)} · ${escapeXml(profile.identity.personality)}</text>
  <text x="156" y="84" font-size="12" font-weight="600" fill="${accent}">${escapeXml(archetypeLabel)}</text>
  <text x="156" y="104" font-size="11" fill="#c3cec6">${escapeXml(stateLine)}</text>
  ${chips}
  <text x="156" y="166" font-size="9" fill="#6f8075">Based on public GitHub activity · gitpet</text>
  <text x="${WIDTH - 16}" y="30" text-anchor="end" font-size="11" font-weight="800" fill="#7cf59a">GITPET</text>
</svg>`;

  return { svg, width: WIDTH, height: HEIGHT };
}
