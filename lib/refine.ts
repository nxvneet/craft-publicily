import type { SceneConfig, Geometry, Motion } from "./scenes";

// Natural-language tweaks applied to a live scene — the "design-change chat".
const COLOR_MAP: Record<string, { a: string; b: string }> = {
  green: { a: "#3effb0", b: "#0aa37a" },
  blue: { a: "#3ec8ff", b: "#0a7cff" },
  red: { a: "#ff5c38", b: "#ffb000" },
  orange: { a: "#ff8a3d", b: "#ffb000" },
  gold: { a: "#f5d58a", b: "#b8862f" },
  yellow: { a: "#d8ff3e", b: "#b8c400" },
  pink: { a: "#ff6fb5", b: "#a45cff" },
  purple: { a: "#a98bff", b: "#5c3cff" },
  violet: { a: "#a98bff", b: "#5c3cff" },
  white: { a: "#f4f1ea", b: "#8d8a84" },
  cyan: { a: "#3effd8", b: "#0ac6a3" },
};

const GEOMETRY_MAP: Record<string, Geometry> = {
  orb: "orb", sphere: "orb", ball: "orb",
  crystal: "crystal", gem: "crystal", diamond: "crystal", prism: "crystal",
  ring: "torus", loop: "torus", knot: "torus", torus: "torus",
  monolith: "monolith", slab: "monolith", cube: "monolith", block: "monolith", tower: "monolith",
  wave: "wave", terrain: "wave", cloth: "wave", flow: "wave",
};

export function refineConfig(c: SceneConfig, raw: string): SceneConfig {
  const t = raw.toLowerCase();
  const next: SceneConfig = { ...c, palette: { ...c.palette } };

  // colour
  for (const [name, cols] of Object.entries(COLOR_MAP)) {
    if (t.includes(name)) {
      next.palette.a = cols.a;
      next.palette.b = cols.b;
    }
  }

  // geometry
  for (const [word, g] of Object.entries(GEOMETRY_MAP)) {
    if (t.includes(word)) next.geometry = g;
  }

  // motion / energy
  if (/(faster|kinetic|energy|wild|intense|dynamic|alive)/.test(t)) {
    next.motion = "kinetic" as Motion;
    next.density = Math.min(1, c.density + 0.2);
  }
  if (/(calmer|slower|calm|gentle|quiet|minimal|still)/.test(t)) {
    next.motion = "calm" as Motion;
    next.density = Math.max(0.2, c.density - 0.2);
  }
  if (/(orbit|spin|rotate|circle)/.test(t)) next.motion = "orbit" as Motion;

  // light/dark
  if (/(darker|dark|night|black)/.test(t)) next.palette.bg = "#030305";
  if (/(brighter|lighter|light)/.test(t)) next.palette.bg = "#0f0f16";

  // surface
  if (/(metal|chrome|steel|mirror)/.test(t)) { next.metal = 0.95; next.rough = 0.08; }
  if (/(glass|crystal|glossy|shine)/.test(t)) { next.rough = 0.03; }
  if (/(matte|soft|clay|rough)/.test(t)) { next.metal = 0.1; next.rough = 0.6; }

  // distortion / particles
  if (/(more particles|busy|dense|crowded)/.test(t)) next.density = Math.min(1, c.density + 0.25);
  if (/(fewer particles|clean|empty|sparse)/.test(t)) next.density = Math.max(0.15, c.density - 0.25);
  if (/(melt|liquid|distort|warp|wobble)/.test(t)) next.distort = Math.min(1, c.distort + 0.25);
  if (/(sharp|crisp|solid|hard)/.test(t)) next.distort = Math.max(0, c.distort - 0.25);

  return next;
}

export function encodeConfig(c: SceneConfig): string {
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(c)))));
}

export function decodeConfig(s: string): SceneConfig | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(s)))));
  } catch {
    return null;
  }
}
