// ─────────────────────────────────────────────────────────────────────────
// Scene config + the prompt → scene "generator".
//
// In production this seam is where a real model plugs in (an LLM to parse
// intent + a video/3D model — e.g. the Higgsfield video pipeline — to author
// assets). For the first draft we ship a deterministic, *instant* generator so
// the one-prompt flow feels magical with zero latency and zero API keys.
// ─────────────────────────────────────────────────────────────────────────

export type Geometry = "orb" | "crystal" | "torus" | "monolith" | "wave";
export type Motion = "calm" | "kinetic" | "orbit";
export type EnvPreset =
  | "city"
  | "sunset"
  | "night"
  | "dawn"
  | "studio"
  | "warehouse";

export type SceneConfig = {
  id: string;
  name: string;
  tagline: string;
  palette: { bg: string; a: string; b: string; c: string };
  geometry: Geometry;
  motion: Motion;
  density: number; // 0..1 particle density
  distort: number; // 0..1 surface turbulence
  metal: number; // 0..1
  rough: number; // 0..1
  env: EnvPreset;
  prompt: string;
  image?: string; // optional AI-generated poster (preset gallery)
  category?: string; // template category label
};

type Palette = SceneConfig["palette"];

const PALETTES: Record<string, Palette> = {
  acid: { bg: "#06060a", a: "#d8ff3e", b: "#7b5cff", c: "#0b0b12" },
  ocean: { bg: "#03060c", a: "#3ec8ff", b: "#0a7cff", c: "#021a2e" },
  ember: { bg: "#0a0503", a: "#ff5c38", b: "#ffb000", c: "#1a0a06" },
  gold: { bg: "#0a0805", a: "#f5d58a", b: "#b8862f", c: "#1c1408" },
  rose: { bg: "#0a050a", a: "#ff6fb5", b: "#a45cff", c: "#1a0a16" },
  mono: { bg: "#070708", a: "#f4f1ea", b: "#8d8a84", c: "#16161a" },
  emerald: { bg: "#03090a", a: "#3effb0", b: "#0aa37a", c: "#04201c" },
  violet: { bg: "#06040c", a: "#a98bff", b: "#5c3cff", c: "#120a26" },
};

type Rule = {
  words: string[];
  palette: keyof typeof PALETTES;
  geometry?: Geometry;
  motion?: Motion;
  env?: EnvPreset;
};

const RULES: Rule[] = [
  { words: ["ocean", "water", "wave", "sea", "fluid", "liquid", "surf", "marine"], palette: "ocean", geometry: "wave", motion: "calm", env: "dawn" },
  { words: ["fire", "energy", "heat", "lava", "sun", "solar", "bold", "sport"], palette: "ember", geometry: "orb", motion: "kinetic", env: "sunset" },
  { words: ["luxury", "gold", "premium", "elegant", "jewel", "watch", "fashion"], palette: "gold", geometry: "crystal", motion: "orbit", env: "studio" },
  { words: ["love", "beauty", "rose", "soft", "skin", "care", "wellness", "bloom"], palette: "rose", geometry: "orb", motion: "calm", env: "dawn" },
  { words: ["ai", "tech", "cyber", "future", "neural", "data", "quantum", "saas"], palette: "violet", geometry: "crystal", motion: "kinetic", env: "night" },
  { words: ["nature", "eco", "green", "emerald", "mint", "jade", "growth", "plant", "organic", "forest"], palette: "emerald", geometry: "wave", motion: "calm", env: "dawn" },
  { words: ["mono", "minimal", "architecture", "studio", "brutal", "concrete", "type"], palette: "mono", geometry: "monolith", motion: "orbit", env: "warehouse" },
  { words: ["space", "cosmic", "galaxy", "star", "night", "dream", "music"], palette: "violet", geometry: "orb", motion: "orbit", env: "night" },
];

const GEOMETRY_WORDS: Record<Geometry, string[]> = {
  orb: ["orb", "sphere", "planet", "ball", "globe"],
  crystal: ["crystal", "gem", "diamond", "shard", "facet", "prism"],
  torus: ["ring", "torus", "loop", "donut", "circle", "orbit"],
  monolith: ["monolith", "slab", "pillar", "tower", "block", "cube", "column"],
  wave: ["wave", "cloth", "fabric", "terrain", "dune", "flow"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Deterministically turn any prompt into a scene config. Instant. */
export function generateScene(prompt: string): SceneConfig {
  const text = prompt.toLowerCase();
  const seed = hash(prompt.trim() || "voxel");

  // score rules by keyword hits
  let best: Rule | null = null;
  let bestScore = 0;
  for (const r of RULES) {
    const score = r.words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  const fallback: Rule = pick(RULES, seed);
  const rule = best ?? fallback;

  // geometry override if the prompt names a shape directly
  let geometry: Geometry = rule.geometry ?? "orb";
  for (const [g, words] of Object.entries(GEOMETRY_WORDS) as [Geometry, string[]][]) {
    if (words.some((w) => text.includes(w))) geometry = g;
  }

  // Explicit colour words override the theme palette so prompts read true.
  const COLOR_OVERRIDE: Record<string, keyof typeof PALETTES> = {
    emerald: "emerald", green: "emerald", mint: "emerald", jade: "emerald",
    ocean: "ocean", blue: "ocean", azure: "ocean", teal: "ocean",
    ember: "ember", fire: "ember", red: "ember", orange: "ember",
    gold: "gold", amber: "gold", champagne: "gold",
    rose: "rose", pink: "rose", blush: "rose",
    violet: "violet", purple: "violet", indigo: "violet",
    mono: "mono", white: "mono", grey: "mono", gray: "mono", monochrome: "mono",
    acid: "acid", lime: "acid", neon: "acid",
  };
  let paletteKey = rule.palette;
  for (const [word, key] of Object.entries(COLOR_OVERRIDE)) {
    if (text.includes(word)) paletteKey = key;
  }
  const palette = PALETTES[paletteKey];
  const energetic = /kinetic|fast|bold|energy|dynamic|sport|electric/.test(text);
  const calm = /calm|soft|slow|minimal|quiet|gentle|zen/.test(text);
  const motion: Motion = energetic ? "kinetic" : calm ? "calm" : rule.motion ?? "orbit";

  const density = calm ? 0.35 : energetic ? 0.9 : 0.6;
  const distort = geometry === "wave" ? 0.85 : geometry === "monolith" ? 0.12 : 0.45;
  const metal = rule.palette === "gold" || rule.palette === "mono" ? 0.9 : 0.35;
  const rough = geometry === "crystal" ? 0.05 : 0.25;

  const name =
    prompt
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Untitled";

  return {
    id: `scn_${Math.abs(seed).toString(36)}`,
    name,
    tagline: prompt.trim() || "An immersive 3D experience",
    palette,
    geometry,
    motion,
    density,
    distort,
    metal,
    rough,
    env: rule.env ?? "studio",
    prompt: prompt.trim(),
  };
}

// Curated presets used on the landing template gallery + builder starters.
// Named, branded starter templates. Each prompt leads with the brand name so the
// generator produces a relevant, on-brand site when "Use This" opens the builder.
export const PRESETS: SceneConfig[] = [
  generateScene("Northwind, a sales CRM SaaS platform for teams, liquid chrome blue, premium"),
  generateScene("Cortex, a neural AI agent platform for developers, kinetic violet, futuristic"),
  generateScene("Velocity, a molten energy drink brand launch, bold and fast"),
  generateScene("Aurum, a luxury gold watch brand, elegant studio orbit"),
  generateScene("Brut, a brutalist architecture and design studio, minimal concrete mono"),
  generateScene("Petal, a soft rose wellness skincare brand, gentle and calm"),
].map((s, i) => ({
  ...s,
  name: ["Northwind", "Cortex", "Velocity", "Aurum", "Brut", "Petal"][i],
  category: ["SaaS CRM", "AI Platform", "Energy / DTC", "Luxury", "Architecture", "Wellness"][i],
  tagline: [
    "Sales CRM for teams",
    "AI agents for developers",
    "Energy drink launch",
    "Luxury watch brand",
    "Architecture studio",
    "Wellness & skincare",
  ][i],
  // Real AI-generated posters (Higgsfield). The builder renders the live scene.
  image: [
    "/presets/hydra.webp",
    "/presets/cortex.webp",
    "/presets/velocity.webp",
    "/presets/aurum.webp",
    "/presets/brut.webp",
    "/presets/petal.webp",
  ][i],
}));
