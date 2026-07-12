import { createRng, pick, seedOf } from "./hash";
import { IDENTITY_VERSION } from "./versions";
import {
  BODY_VARIANTS,
  FACE_VARIANTS,
  PERSONALITIES,
  SPECIES,
  type BodyVariant,
  type FaceVariant,
  type Personality,
  type Species,
} from "./schema";

export type PetIdentity = {
  identityVersion: number;
  seed: string;
  name: string;
  species: Species;
  bodyVariant: BodyVariant;
  faceVariant: FaceVariant;
  personality: Personality;
  palette: string;
};

export const PALETTE_IDS = ["amber", "slate", "moss", "rose", "cocoa", "mint"] as const;

const NAME_POOL = [
  "Miso", "Pixel", "Mochi", "Byte", "Juno", "Tofu",
  "Nori", "Clover", "Ash", "Poppy", "Biscuit", "Luna",
  "Kiwi", "Pebble", "Waffle", "Sage", "Ollie", "Nova",
] as const;

/**
 * Stable identity derived only from the normalized username.
 * Same username + same IDENTITY_VERSION → always the same pet.
 */
export function buildIdentity(username: string): PetIdentity {
  const normalized = username.toLowerCase();
  const rng = createRng(`identity:v${IDENTITY_VERSION}:${normalized}`);

  return {
    identityVersion: IDENTITY_VERSION,
    seed: seedOf(normalized),
    name: pick(rng, NAME_POOL),
    species: pick(rng, SPECIES),
    bodyVariant: pick(rng, BODY_VARIANTS),
    faceVariant: pick(rng, FACE_VARIANTS),
    personality: pick(rng, PERSONALITIES),
    palette: pick(rng, PALETTE_IDS),
  };
}
