// Image bank for generated sites. Real assets (same-origin) so the output looks
// finished instead of using empty gradient placeholders. Picks are deterministic
// per (industry + seed) so a given prompt always renders the same art.

const ABSTRACT = [
  "/presets/aurum.webp",
  "/presets/cortex.webp",
  "/presets/hydra.webp",
  "/presets/velocity.webp",
  "/presets/brut.webp",
  "/presets/petal.webp",
];

const CINE = ["/cine/cyber.png", "/cine/studio.png", "/cine/bloom.png"];

const PHOTO = [
  "haunting-london", "superdry-aw23", "google-maps", "nandos-extra-hot",
  "data-ai-trends", "monumental-beanies", "diageo-blue", "inessa-biocyte",
  "free-spirits", "bridget-jones", "ai-compass", "diageo-aurora",
  "footboo", "nbc-universal", "octopus-energy", "venus-studio",
].map((s) => `/gallery/${s}.jpg`);

// industry → which photo set reads best as the "case study" imagery
const PHOTO_SETS: Record<string, number[]> = {
  saas: [2, 4, 10, 14],
  ai: [4, 10, 5, 11],
  finance: [6, 11, 14, 2],
  studio: [15, 5, 8, 1],
  commerce: [1, 12, 3, 9],
  wellness: [7, 5, 3, 11],
};

function rot<T>(arr: T[], seed: number, i: number): T {
  return arr[Math.abs(seed + i * 7) % arr.length];
}

/** Cinematic-ish hero backdrop for non-product archetypes. */
export function heroImage(industry: string, seed: number): string {
  const set = PHOTO_SETS[industry] ?? [0, 4, 8, 12];
  return PHOTO[set[Math.abs(seed) % set.length]];
}

/** Abstract tiles for feature cards (neutral, on-brand). */
export function featureImages(seed: number, n: number): string[] {
  return Array.from({ length: n }, (_, i) => rot(ABSTRACT, seed, i));
}

/** Photographic tiles for the showcase / gallery section. */
export function showcaseImages(industry: string, seed: number, n: number): string[] {
  const set = PHOTO_SETS[industry] ?? [0, 3, 6, 9];
  return Array.from({ length: n }, (_, i) => PHOTO[set[(Math.abs(seed) + i) % set.length]]);
}

/** A big cinematic render for the closing scroll section. */
export function cineImage(seed: number): string {
  return CINE[Math.abs(seed) % CINE.length];
}

/** Product archetypes get a UI mockup; the rest get a real image hero. */
export function usesMockup(industry: string): boolean {
  return industry === "saas" || industry === "ai" || industry === "finance";
}
