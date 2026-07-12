import { buildIdentity } from "./identity";
import { buildTechProfile } from "./archetypes";
import { buildAppearance } from "./fusion";
import { buildState } from "./state";
import { gitPetProfileSchema, type GitPetProfile, type PetEngineInput } from "./schema";

/**
 * Pure function: normalized inputs → validated GitPetProfile.
 * No I/O here, so fixtures, tests, API routes and pages all reuse it as-is.
 */
export function buildPetProfile(input: PetEngineInput): GitPetProfile {
  const now = input.syncedAt ?? new Date();
  const username = input.username.trim();

  const identity = buildIdentity(username);
  const tech = buildTechProfile(input.repos, now);
  const appearance = buildAppearance(tech);
  const state = buildState(username, input.activity, now);

  const profile: GitPetProfile = {
    username,
    generatedAt: new Date().toISOString(),
    lastSyncedAt: now.toISOString(),
    source: {
      visibility: "public",
      label: "Based on public GitHub activity",
    },
    identity: {
      identityVersion: identity.identityVersion,
      seed: identity.seed,
      name: identity.name,
      species: identity.species,
      bodyVariant: identity.bodyVariant,
      faceVariant: identity.faceVariant,
      personality: identity.personality,
      palette: identity.palette,
    },
    tech: {
      fusionVersion: appearance.fusionVersion,
      primaryArchetype: tech.primaryArchetype,
      secondaryArchetype: tech.secondaryArchetype,
      tertiaryArchetype: tech.tertiaryArchetype,
      languages: tech.languages,
      confidence: tech.confidence,
      evidence: tech.evidence,
    },
    appearance: {
      assetVersion: appearance.assetVersion,
      traits: appearance.traits,
      outfit: appearance.outfit,
      workstation: appearance.workstation,
      roomTheme: appearance.roomTheme,
      accessory: appearance.accessory,
      effect: appearance.effect,
    },
    state,
  };

  return gitPetProfileSchema.parse(profile);
}
