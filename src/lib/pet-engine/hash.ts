/** Deterministic hashing + seeded RNG. No Math.random anywhere in the engine. */

/** FNV-1a 32-bit hash of a string. */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG — tiny, deterministic, good enough distribution for trait picks. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SeededRng = () => number;

export function createRng(seedText: string): SeededRng {
  return mulberry32(fnv1a32(seedText));
}

/** Deterministically pick one item from a list using the rng. */
export function pick<T>(rng: SeededRng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Hex seed string exposed in the profile for debuggability. */
export function seedOf(username: string): string {
  return fnv1a32(username.toLowerCase()).toString(16).padStart(8, "0");
}
