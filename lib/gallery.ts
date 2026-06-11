/**
 * Data + thumbnail compositing for the V3 spherical gallery.
 *
 * Each "project" is a proportional grid cell: a real photo framed inside the
 * cell with phantom-style labels in the margins (client + title on top, tag
 * pills + year below). Images live in /public/gallery (same-origin, so they
 * bake into the canvas texture without tainting it / breaking the WebGL upload).
 *
 * The palette is still used for the detail-page hero gradient and as the
 * placeholder fill shown until the photo loads.
 */

export type ArtVariant = "mesh" | "duotone" | "orbs" | "grid" | "wave" | "split";

/** Each project opens as its own site — these archetypes give 4 distinct looks. */
export type SiteLayout = "editorial" | "product" | "campaign" | "motion";

export interface Project {
  slug: string;
  client: string;
  title: string;
  tags: string[];
  year: string;
  palette: [string, string];
  art: ArtVariant;
  layout: SiteLayout;
  overview: string; // one-line case-study intro
}

export const PROJECTS: Project[] = [
  { slug: "haunting-london", client: "1D", title: "10 Years of One Direction", tags: ["Experience", "Website", "Campaign"], year: "2018", palette: ["#e7e3da", "#9aa0b5"], art: "grid", layout: "editorial", overview: "A decade of One Direction, reimagined as an immersive scrolling archive of sound, image and memory." },
  { slug: "superdry-aw23", client: "Superdry®", title: "Puffer AW23", tags: ["Communication", "Campaign", "Brand"], year: "2023", palette: ["#ff5c2e", "#3a1206"], art: "orbs", layout: "campaign", overview: "The AW23 puffer drop, shot as a study in heat and texture for a global product launch." },
  { slug: "google-maps", client: "Google", title: "Mountain View Visitor", tags: ["Product", "Website", "Tool"], year: "2020", palette: ["#4f8bff", "#0a1d4d"], art: "mesh", layout: "product", overview: "A visitor experience for Google's Mountain View campus, turning wayfinding into play." },
  { slug: "nandos-extra-hot", client: "Nando's", title: "Extra Hot Drop", tags: ["Communication", "Campaign", "Social"], year: "2022", palette: ["#19a36b", "#08361f"], art: "split", layout: "motion", overview: "An extra-hot social campaign that turned the nation's spice tolerance into a spectator sport." },
  { slug: "data-ai-trends", client: "Studio", title: "Data & AI Trends", tags: ["Experience", "Motion", "Website"], year: "2024", palette: ["#2b3a67", "#070b18"], art: "wave", layout: "motion", overview: "An annual data & AI trends report rebuilt as a living, motion-driven editorial." },
  { slug: "monumental-beanies", client: "Beavertown", title: "Monumental Beanies", tags: ["Communication", "Content", "Campaign"], year: "2023", palette: ["#86b8e8", "#123a5e"], art: "duotone", layout: "editorial", overview: "A content series celebrating monumental beanies against the skyline of a city." },
  { slug: "diageo-blue", client: "Diageo", title: "Crafted For Dad", tags: ["Experience", "OOH", "Physical"], year: "2025", palette: ["#1450c8", "#04113a"], art: "mesh", layout: "product", overview: "Crafted for Dad — a premium spirits experience with a tactile, OOH-led launch." },
  { slug: "inessa-biocyte", client: "Inessa", title: "Motion Identity", tags: ["Communication", "Brand", "Content"], year: "2022", palette: ["#efe9dc", "#b7ad94"], art: "split", layout: "campaign", overview: "A motion identity for a biotech wellness brand, built on cellular rhythm." },
  { slug: "free-spirits", client: "Octopus", title: "Free Spirits Center", tags: ["Experience", "Spatial", "Web"], year: "2021", palette: ["#c9ccd6", "#3a3f52"], art: "orbs", layout: "editorial", overview: "A spatial brand center for free spirits, blending architecture and interface." },
  { slug: "bridget-jones", client: "Working Title", title: "Bridget Jones OOH", tags: ["Communication", "Print", "Campaign"], year: "2024", palette: ["#d2452f", "#2a0a07"], art: "duotone", layout: "campaign", overview: "An out-of-home campaign for the return of a beloved icon, plastered across the city." },
  { slug: "ai-compass", client: "FT", title: "AI Compass", tags: ["Product", "Editorial", "Tool"], year: "2025", palette: ["#ff9a3c", "#5a2a06"], art: "wave", layout: "product", overview: "An editorial tool that helps readers navigate the fast-moving world of AI." },
  { slug: "diageo-aurora", client: "Diageo", title: "Aurora Launch", tags: ["Brand", "Motion", "3D"], year: "2025", palette: ["#0a2a6b", "#5cc8ff"], art: "mesh", layout: "motion", overview: "A 3D launch film and identity for a luminous new spirit." },
  { slug: "footboo", client: "Footboo", title: "Match Day Drop", tags: ["Campaign", "Social", "Brand"], year: "2023", palette: ["#e23030", "#2a0606"], art: "split", layout: "campaign", overview: "A match-day drop that turned football culture into a streetwear moment." },
  { slug: "nbc-universal", client: "NBCUniversal", title: "Next Stop", tags: ["Experience", "OOH", "Spatial"], year: "2024", palette: ["#b8492a", "#1a0b06"], art: "orbs", layout: "editorial", overview: "A spatial OOH experience announcing the next stop in a beloved franchise." },
  { slug: "octopus-energy", client: "Octopus", title: "Smarter Tariffs", tags: ["Product", "Website", "Tool"], year: "2022", palette: ["#7b5cff", "#160a3a"], art: "grid", layout: "product", overview: "A product site that makes smarter energy tariffs genuinely easy to understand." },
  { slug: "venus-studio", client: "Studio", title: "Venus Identity", tags: ["Brand", "3D", "Motion"], year: "2024", palette: ["#d8ff3e", "#1a2406"], art: "wave", layout: "motion", overview: "A 3D brand identity exploring light, form and motion for a creative studio." },
];

export const imageFor = (p: Project) => `/gallery/${p.slug}.jpg`;

/** A few related images for a project's gallery section (its own + neighbours). */
export function galleryImages(p: Project, n = 4): string[] {
  const i = PROJECTS.findIndex((x) => x.slug === p.slug);
  return Array.from({ length: n }, (_, k) => imageFor(PROJECTS[(i + k) % PROJECTS.length]));
}

/** Deterministic but plausible "results" numbers, seeded by slug. */
export function projectStats(p: Project): { value: string; label: string }[] {
  let h = 0;
  for (let i = 0; i < p.slug.length; i++) h = (h * 31 + p.slug.charCodeAt(i)) | 0;
  const a = Math.abs(h);
  const reach = (1 + (a % 90) / 10).toFixed(1); // 1.0–9.9
  const lift = 18 + (a % 62); // 18–79
  const markets = 4 + (a % 28); // 4–31
  return [
    { value: `${reach}M`, label: "reach" },
    { value: `+${lift}%`, label: "engagement" },
    { value: `${markets}`, label: "markets" },
  ];
}

/** The next project in the reel — powers "Next project →". */
export function nextProject(p: Project): Project {
  const i = PROJECTS.findIndex((x) => x.slug === p.slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
}

/* ── canvas helpers ─────────────────────────────────────────────────── */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* the proportional cell, in canvas pixels — exported so the plane can match it.
   Wide (≈1.9:1) so cards fill the spherical grid cells with thin gutters,
   matching phantom's landscape panels. */
export const CARD_W = 1180;
export const CARD_H = 900; // ≈1.31:1 landscape, like phantom's panels
const PAD_X = 32;
const TOP_BAND = 62;
const BOT_BAND = 72;
const IMG = {
  x: PAD_X,
  y: TOP_BAND,
  w: CARD_W - PAD_X * 2,
  h: CARD_H - TOP_BAND - BOT_BAND,
};

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(244,241,234,0.16)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(IMG.x + 0.75, IMG.y + 0.75, IMG.w - 1.5, IMG.h - 1.5);
}

function drawLabels(ctx: CanvasRenderingContext2D, p: Project) {
  // top: client (left, serif)  ·  title (right, mono caps)
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(244,241,234,0.92)";
  ctx.font = "600 28px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(p.client, IMG.x + 2, TOP_BAND - 18);

  ctx.fillStyle = "rgba(244,241,234,0.7)";
  ctx.font = "500 20px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText(p.title.toUpperCase(), IMG.x + IMG.w - 2, TOP_BAND - 18);

  // bottom: tag pills (left)  ·  year (right)
  const by = CARD_H - 22;
  ctx.font = "500 19px ui-monospace, monospace";
  ctx.textAlign = "left";
  let px = IMG.x + 2;
  for (const tag of p.tags) {
    const label = tag.toUpperCase();
    const tw = ctx.measureText(label).width;
    ctx.strokeStyle = "rgba(244,241,234,0.28)";
    ctx.lineWidth = 1.4;
    roundRect(ctx, px, by - 24, tw + 26, 36, 18);
    ctx.stroke();
    ctx.fillStyle = "rgba(244,241,234,0.85)";
    ctx.fillText(label, px + 13, by);
    px += tw + 26 + 11;
  }

  ctx.fillStyle = "rgba(244,241,234,0.55)";
  ctx.font = "500 24px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText(p.year, IMG.x + IMG.w - 2, by);
}

/**
 * Bake one card onto a transparent canvas. Labels + frame paint immediately;
 * the real photo is loaded async and cover-fit into the frame, calling
 * `onReady` so the caller can flag the texture for a GPU re-upload.
 */
export function makeCardCanvas(p: Project, onReady?: () => void): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // placeholder fill (palette) until the photo arrives
  const g = ctx.createLinearGradient(IMG.x, IMG.y, IMG.x + IMG.w, IMG.y + IMG.h);
  g.addColorStop(0, p.palette[0]);
  g.addColorStop(1, p.palette[1]);
  ctx.fillStyle = g;
  ctx.fillRect(IMG.x, IMG.y, IMG.w, IMG.h);

  drawFrame(ctx);
  drawLabels(ctx, p);

  const img = new Image();
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(IMG.x, IMG.y, IMG.w, IMG.h);
    ctx.clip();
    // cover-fit
    const ir = IMG.w / IMG.h;
    const sr = img.width / img.height;
    let sw: number, sh: number, sx: number, sy: number;
    if (sr > ir) {
      sh = img.height;
      sw = sh * ir;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / ir;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, IMG.x, IMG.y, IMG.w, IMG.h);
    ctx.restore();
    drawFrame(ctx); // redraw the 1px frame on top of the photo edge
    onReady?.();
  };
  img.src = imageFor(p);

  return canvas;
}
