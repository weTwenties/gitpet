import { FUSION_VERSION, ASSET_VERSION } from "./versions";
import type { Archetype, ArchetypeOrUnknown } from "./schema";
import type { TechProfile } from "./archetypes";

/**
 * Trait-based fusion (roadmap Phase 5): archetypes never swap the whole pet,
 * they only fill fixed trait slots.
 *   primary   → outfit + workstation + room theme
 *   secondary → handheld accessory
 *   tertiary  → ambient visual effect
 */

const OUTFITS: Record<Archetype, string> = {
  interface: "studio-hoodie",
  backend: "field-apron",
  systems: "utility-vest",
  data: "observatory-coat",
};

const WORKSTATIONS: Record<Archetype, string> = {
  interface: "dual-monitor",
  backend: "terminal-rig",
  systems: "workbench",
  data: "chart-station",
};

const ROOM_THEMES: Record<Archetype, string> = {
  interface: "studio-loft",
  backend: "server-den",
  systems: "workshop",
  data: "observatory",
};

const ACCESSORIES: Record<Archetype, string> = {
  interface: "design-tablet",
  backend: "coffee-mug",
  systems: "wrench",
  data: "chart-card",
};

const EFFECTS: Record<Archetype, string> = {
  interface: "pixel-sparkles",
  backend: "steam-wisps",
  systems: "ember-dots",
  data: "data-motes",
};

/** Neutral fallback when there is no readable public language signal. */
const UNKNOWN_APPEARANCE = {
  outfit: "plain-scarf",
  workstation: "simple-desk",
  roomTheme: "cozy-corner",
};

export type PetAppearance = {
  assetVersion: number;
  fusionVersion: number;
  traits: string[];
  outfit: string;
  workstation: string;
  roomTheme: string;
  accessory?: string;
  effect?: string;
};

export function buildAppearance(tech: TechProfile): PetAppearance {
  const primary: ArchetypeOrUnknown = tech.primaryArchetype;

  if (primary === "unknown") {
    return {
      assetVersion: ASSET_VERSION,
      fusionVersion: FUSION_VERSION,
      traits: ["explorer"],
      ...UNKNOWN_APPEARANCE,
    };
  }

  const traits: string[] = [`primary:${primary}`];
  if (tech.secondaryArchetype) traits.push(`secondary:${tech.secondaryArchetype}`);
  if (tech.tertiaryArchetype) traits.push(`tertiary:${tech.tertiaryArchetype}`);

  return {
    assetVersion: ASSET_VERSION,
    fusionVersion: FUSION_VERSION,
    traits,
    outfit: OUTFITS[primary],
    workstation: WORKSTATIONS[primary],
    roomTheme: ROOM_THEMES[primary],
    accessory: tech.secondaryArchetype ? ACCESSORIES[tech.secondaryArchetype] : undefined,
    effect: tech.tertiaryArchetype ? EFFECTS[tech.tertiaryArchetype] : undefined,
  };
}
