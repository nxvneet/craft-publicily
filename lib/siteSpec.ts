// ─────────────────────────────────────────────────────────────────────────
// SiteSpec v3 — a PROMPT-DRIVEN page, not a recolored template.
//
// A site is an ordered list of typed blocks (hero, menu, gallery, pricing,
// team, faq, …) chosen and composed per prompt. Different intents produce
// different STRUCTURES — a restaurant gets a menu + hours, a portfolio gets a
// masonry gallery, a SaaS gets pricing + a product hero. The LLM (see
// /api/generate) composes this shape; the deterministic composer below builds
// an intent-tailored version instantly with no API key.
// ─────────────────────────────────────────────────────────────────────────

import { generateScene, type SceneConfig } from "./scenes";

export type Theme = "light" | "dark";
export type FontPair = "grotesk" | "editorial" | "mono" | "display";

export type Tokens = {
  theme: Theme;
  palette: { bg: string; a: string; b: string };
  font: FontPair;
  radius: "sharp" | "soft" | "pill";
};

type H = { hidden?: boolean };
export type Block =
  | ({ type: "hero"; variant: "split" | "centered" | "fullbleed" | "editorial"; eyebrow: string; headline: string; sub: string; cta: string; media: "3d" | "image" | "none" } & H)
  | ({ type: "marquee"; items: string[] } & H)
  | ({ type: "logos"; label: string; items: string[] } & H)
  | ({ type: "statement"; text: string } & H)
  | ({ type: "features"; variant: "rows" | "grid" | "bento"; kicker: string; title: string; items: { title: string; body: string }[] } & H)
  | ({ type: "gallery"; variant: "masonry" | "grid"; kicker: string; title: string; items: { title: string; tag: string }[] } & H)
  | ({ type: "menu"; kicker: string; title: string; items: { name: string; price: string; desc: string }[] } & H)
  | ({ type: "steps"; kicker: string; title: string; items: { title: string; body: string }[] } & H)
  | ({ type: "stats"; kicker: string; items: { value: string; label: string }[] } & H)
  | ({ type: "team"; kicker: string; title: string; items: { name: string; role: string }[] } & H)
  | ({ type: "testimonials"; kicker: string; items: { quote: string; author: string; role: string }[] } & H)
  | ({ type: "pricing"; kicker: string; title: string; tiers: { name: string; price: string; period: string; features: string[]; cta: string; featured?: boolean }[] } & H)
  | ({ type: "faq"; kicker: string; title: string; items: { q: string; a: string }[] } & H)
  | ({ type: "cta"; title: string; button: string } & H)
  | ({ type: "contact"; kicker: string; title: string; email: string; note: string } & H);

export type BlockType = Block["type"];

export type SiteSpec = {
  v: 3;
  archetype: string;
  scene: SceneConfig;
  image: string;
  tokens: Tokens;
  brand: { name: string; tagline: string };
  nav: { links: string[]; cta: string };
  blocks: Block[];
  // legacy compatibility shims (some old code reads these)
  industry: string;
  typeStyle: FontPair;
  theme?: Theme;
};

/* ── palettes (a = accent, contrasts with bg) ───────────────────────────── */
const PAL = {
  acid: { bg: "#0b0b10", a: "#d8ff3e", b: "#7b5cff" },
  ocean: { bg: "#04101e", a: "#3ec8ff", b: "#0a7cff" },
  ember: { bg: "#140604", a: "#ff5c38", b: "#ffb000" },
  violet: { bg: "#0a0613", a: "#a98bff", b: "#5c3cff" },
  rose: { bg: "#160a12", a: "#ff6fb5", b: "#a45cff" },
  paper: { bg: "#f4f1ea", a: "#d4452c", b: "#1b1a17" },
  sage: { bg: "#eef1ea", a: "#56714e", b: "#222a1d" },
  bone: { bg: "#f3efe6", a: "#161514", b: "#8a8276" },
  sky: { bg: "#eef2f6", a: "#1f5fd6", b: "#10213d" },
};
type PalKey = keyof typeof PAL;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

function brandName(prompt: string, seed: number): string {
  const capWord = prompt.split(/\s+/).find((w) => /^[A-Z][a-zA-Z]{2,}$/.test(w));
  if (capWord) return capWord;
  const coined = ["Atlas", "Nova", "Halo", "Vela", "Orbit", "Lumen", "Forge", "Onyx", "Aero", "Pulse", "Mire", "Sable", "Hearth", "Quill"];
  return coined[seed % coined.length];
}

/* ── archetypes: each composes a DIFFERENT page ─────────────────────────── */
type Archetype = {
  key: string;
  words: string[];
  theme: Theme;
  pal: PalKey;
  font: FontPair;
  radius: Tokens["radius"];
  nav: string[];
  /** build the ordered block list for this intent */
  build: (ctx: Ctx) => Block[];
};
type Ctx = { prompt: string; name: string; seed: number; subject: string };

/* helpers that emit common blocks, themed by intent wording */
const marquee = (items: string[]): Block => ({ type: "marquee", items });
const cta = (title: string, button: string): Block => ({ type: "cta", title, button });

const ARCHETYPES: Archetype[] = [
  {
    key: "restaurant",
    words: ["restaurant", "cafe", "café", "coffee", "bistro", "kitchen", "dining", "eatery", "bakery", "bar ", "menu", "food", "pizzeria", "ramen", "sushi", "deli", "brunch"],
    theme: "dark",
    pal: "ember",
    font: "editorial",
    radius: "soft",
    nav: ["Menu", "Story", "Visit", "Book"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "fullbleed", eyebrow: "Est. 2024 · Open daily", headline: name, sub: cap(prompt.trim() || `${name} — seasonal plates, natural wine, warm rooms.`), cta: "Book a table", media: "image" },
      { type: "statement", text: `A short walk from everywhere, ${name} is where the neighbourhood comes to eat slowly.` },
      { type: "menu", kicker: "The Menu", title: "What we're serving", items: [
        { name: "Burrata & heirloom tomato", price: "14", desc: "Basil oil, sourdough, sea salt" },
        { name: "Hand-rolled tagliatelle", price: "19", desc: "Slow ragù, parmesan, pepper" },
        { name: "Charcoal sea bream", price: "26", desc: "Fennel, lemon, brown butter" },
        { name: "Dark chocolate tart", price: "11", desc: "Crème fraîche, cocoa nib" },
      ] },
      { type: "gallery", variant: "masonry", kicker: "The Room", title: "Inside", items: [
        { title: "The bar", tag: "Evening" }, { title: "The kitchen", tag: "Open pass" }, { title: "The terrace", tag: "Summer" },
      ] },
      { type: "stats", kicker: "Why people come back", items: [
        { value: "4.9★", label: "1,200 reviews" }, { value: "Mon–Sun", label: "from 5pm" }, { value: "No.7", label: "in the city" },
      ] },
      { type: "testimonials", kicker: "Word of mouth", items: [
        { quote: "The kind of place you cancel other plans for.", author: "The Local Table", role: "Review" },
      ] },
      { type: "contact", kicker: "Visit", title: "Find us & book", email: "hello@" + name.toLowerCase() + ".com", note: "12 Ember Lane · walk-ins welcome at the bar" },
    ],
  },
  {
    key: "portfolio",
    words: ["portfolio", "photographer", "photography", "designer", "artist", "illustrator", "director", "freelance", "personal site", "my work", "showreel", "creative cv"],
    theme: "light",
    pal: "bone",
    font: "editorial",
    radius: "sharp",
    nav: ["Work", "About", "Index", "Contact"],
    build: ({ name, prompt, subject }) => [
      { type: "hero", variant: "editorial", eyebrow: `${subject} · Selected work`, headline: name, sub: cap(prompt.trim() || `${name} is a ${subject} working across image, motion and print.`), cta: "View work", media: "none" },
      { type: "gallery", variant: "masonry", kicker: "Selected", title: "Recent work", items: [
        { title: "Aperture", tag: "Editorial" }, { title: "Field Notes", tag: "Series" }, { title: "Nocturne", tag: "Personal" }, { title: "Bloom", tag: "Commission" }, { title: "Static", tag: "Motion" },
      ] },
      { type: "statement", text: `I make work that earns a second look — quiet, considered, and built to last.` },
      { type: "logos", label: "Selected clients", items: ["Aesop", "Kinfolk", "MUBI", "Cereal", "Nike", "Wallpaper*"] },
      { type: "stats", kicker: "A little context", items: [
        { value: "10yr", label: "making" }, { value: "60+", label: "projects" }, { value: "3", label: "awards" },
      ] },
      { type: "contact", kicker: "Say hello", title: "Let's make something", email: "studio@" + name.toLowerCase() + ".com", note: "Available for commissions · worldwide" },
    ],
  },
  {
    key: "saas",
    words: ["saas", "app", "software", "platform", "tool", "dashboard", "api", "developer", "startup", "ai", "agent", "automation", "analytics", "crm", "productivity"],
    theme: "dark",
    pal: "acid",
    font: "grotesk",
    radius: "pill",
    nav: ["Features", "Pricing", "Docs", "Customers"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "split", eyebrow: "New · v1.0", headline: "Ship faster", sub: cap(prompt.trim() || `${name} is the fastest way to ship — built for teams who hate waiting.`), cta: "Start free", media: "3d" },
      { type: "logos", label: "Trusted by teams at", items: ["Northwind", "Lumen", "Vela", "Orbit", "Atlas", "Forge"] },
      { type: "features", variant: "bento", kicker: "Why it works", title: "Everything in one place", items: [
        { title: "Built for speed", body: "Every action is one keystroke away. No spinners, just momentum." },
        { title: "Plays with your stack", body: "Native integrations and a clean API slot into what you already use." },
        { title: "Secure by default", body: "SOC 2, SSO and granular roles, ready on day one." },
        { title: "Insight that compounds", body: "Real-time analytics so every decision is backed by data." },
      ] },
      { type: "stats", kicker: "By the numbers", items: [
        { value: "10×", label: "faster to launch" }, { value: "99.99%", label: "uptime" }, { value: "40k+", label: "teams" },
      ] },
      { type: "steps", kicker: "How it works", title: "Live in three steps", items: [
        { title: "Connect", body: "Link your sources in a click." }, { title: "Configure", body: "Tune it to your workflow." }, { title: "Ship", body: "Go live in minutes." },
      ] },
      { type: "pricing", kicker: "Pricing", title: "Simple, honest pricing", tiers: [
        { name: "Free", price: "$0", period: "forever", features: ["1 project", "Community support", "Core features"], cta: "Start free" },
        { name: "Pro", price: "$24", period: "/mo", features: ["Unlimited projects", "Priority support", "Advanced analytics", "API access"], cta: "Go Pro", featured: true },
        { name: "Team", price: "Custom", period: "", features: ["SSO + roles", "SLA", "Dedicated CSM"], cta: "Contact us" },
      ] },
      { type: "faq", kicker: "FAQ", title: "Questions, answered", items: [
        { q: "Is there a free plan?", a: "Yes — free forever for solo projects, no card required." },
        { q: "Can I export my data?", a: "Always. Your data is yours, exportable any time." },
        { q: "Do you offer SSO?", a: "SSO and SCIM are available on Team and above." },
      ] },
      cta("Ready to ship faster?", "Start free"),
    ],
  },
  {
    key: "agency",
    words: ["agency", "studio", "creative", "branding", "design studio", "production", "collective", "consultancy", "marketing"],
    theme: "dark",
    pal: "violet",
    font: "display",
    radius: "soft",
    nav: ["Work", "Studio", "Services", "Contact"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "editorial", eyebrow: "Independent creative studio", headline: "Make it unforgettable", sub: cap(prompt.trim() || `${name} is a creative studio crafting brands, films and experiences.`), cta: "See the work", media: "3d" },
      marquee(["BRANDING", "MOTION", "WEB", "SPATIAL", "FILM", "STRATEGY"]),
      { type: "features", variant: "rows", kicker: "What we do", title: "Services", items: [
        { title: "Brand & identity", body: "Names, marks and systems with teeth — built to be remembered." },
        { title: "Motion & film", body: "Story-led films and loops that earn the double-take." },
        { title: "Web & spatial", body: "Real-time, scroll-driven experiences for screens of every size." },
      ] },
      { type: "gallery", variant: "grid", kicker: "Selected work", title: "Recent projects", items: [
        { title: "Aurora", tag: "Brand" }, { title: "Halcyon", tag: "Film" }, { title: "Drift", tag: "Web" }, { title: "Monolith", tag: "Spatial" },
      ] },
      { type: "stats", kicker: "Track record", items: [
        { value: "30+", label: "awards" }, { value: "120", label: "brands" }, { value: "15yr", label: "making" },
      ] },
      { type: "testimonials", kicker: "Clients say", items: [
        { quote: "They gave us a brand people actually screenshot. Sales followed.", author: "Lena Ortiz", role: "Founder, Atelier Nine" },
      ] },
      cta("Let's build something worth sharing.", "Start a project"),
    ],
  },
  {
    key: "commerce",
    words: ["shop", "store", "ecommerce", "product", "brand", "fashion", "sneaker", "drop", "retail", "apparel", "drink", "skincare cream", "candle", "jewellery", "jewelry"],
    theme: "dark",
    pal: "rose",
    font: "display",
    radius: "soft",
    nav: ["Shop", "Lookbook", "About", "Cart"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "fullbleed", eyebrow: "New drop · Limited", headline: name, sub: cap(prompt.trim() || `${name} — made to be felt, limited by design.`), cta: "Shop the drop", media: "image" },
      marquee(["NEW DROP", "FREE RETURNS", "SHIPS FAST", "LIMITED", "5-STAR"]),
      { type: "gallery", variant: "grid", kicker: "The collection", title: "Shop the line", items: [
        { title: "The Signature", tag: "Bestseller" }, { title: "The Limited", tag: "New" }, { title: "The Essential", tag: "Everyday" },
      ] },
      { type: "features", variant: "grid", kicker: "Why you'll love it", title: "Made to be felt", items: [
        { title: "Made to last", body: "Engineered for the moment it lands in your hands." },
        { title: "Limited by design", body: "Small batches, big presence. When it's gone, it's gone." },
        { title: "Ships in 48h", body: "Carbon-neutral delivery, tracked end to end." },
      ] },
      { type: "testimonials", kicker: "Loved out loud", items: [
        { quote: "Easily the best thing I've bought all year. The packaging alone.", author: "Jordan Vela", role: "Verified buyer" },
      ] },
      cta("Don't miss the drop.", "Shop now"),
    ],
  },
  {
    key: "wellness",
    words: ["wellness", "health", "skincare", "spa", "yoga", "fitness", "gym", "meditation", "beauty", "mindfulness", "therapy", "retreat", "clinic"],
    theme: "light",
    pal: "sage",
    font: "editorial",
    radius: "pill",
    nav: ["About", "Rituals", "Pricing", "Book"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "centered", eyebrow: "Slow down on purpose", headline: name, sub: cap(prompt.trim() || `${name} helps you feel like yourself again — a ritual, not a chore.`), cta: "Begin", media: "image" },
      { type: "features", variant: "grid", kicker: "The difference", title: "Kind to everything", items: [
        { title: "Backed by science", body: "Clinically-studied, nothing you can't pronounce." },
        { title: "Kind to the planet", body: "Cruelty-free, reef-safe, refillable." },
        { title: "A daily ritual", body: "The best ninety seconds of your morning." },
      ] },
      { type: "steps", kicker: "The ritual", title: "Three slow steps", items: [
        { title: "Breathe", body: "Begin with one intentional moment." }, { title: "Apply", body: "A little goes a long way." }, { title: "Glow", body: "Show up as the calmest person in the room." },
      ] },
      { type: "stats", kicker: "Results", items: [
        { value: "97%", label: "saw results in 2 weeks" }, { value: "0", label: "nasties, ever" }, { value: "1M+", label: "rituals a month" },
      ] },
      { type: "pricing", kicker: "Memberships", title: "Find your rhythm", tiers: [
        { name: "Day pass", price: "$29", period: "", features: ["Single visit", "All facilities"], cta: "Book" },
        { name: "Monthly", price: "$120", period: "/mo", features: ["Unlimited visits", "Guest passes", "Member events"], cta: "Join", featured: true },
        { name: "Annual", price: "$1,100", period: "/yr", features: ["Everything monthly", "2 months free", "Priority booking"], cta: "Join" },
      ] },
      { type: "testimonials", kicker: "Members say", items: [
        { quote: "Three weeks in and my skin — and honestly my mood — is different.", author: "Sana Iqbal", role: "Member" },
      ] },
      cta("Your calmest self is waiting.", "Begin today"),
    ],
  },
  {
    key: "event",
    words: ["event", "conference", "summit", "festival", "meetup", "workshop", "launch event", "expo", "concert", "wedding", "gala"],
    theme: "dark",
    pal: "ocean",
    font: "grotesk",
    radius: "sharp",
    nav: ["About", "Speakers", "Schedule", "Tickets"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "centered", eyebrow: "Sept 12–14 · London", headline: name, sub: cap(prompt.trim() || `${name} — three days of talks, workshops and the people building what's next.`), cta: "Get tickets", media: "3d" },
      marquee(["3 DAYS", "40 SPEAKERS", "12 WORKSHOPS", "1 CITY"]),
      { type: "team", kicker: "Speakers", title: "Who you'll hear from", items: [
        { name: "Maya Chen", role: "VP Eng, Northwind" }, { name: "Dev Patel", role: "Founder, Lumen" }, { name: "Lena Ortiz", role: "Atelier Nine" }, { name: "Tomás Rivera", role: "Author" },
      ] },
      { type: "steps", kicker: "Schedule", title: "Three days", items: [
        { title: "Day 1 — Foundations", body: "Keynotes and the state of the field." }, { title: "Day 2 — Deep dives", body: "Hands-on workshops in small rooms." }, { title: "Day 3 — What's next", body: "Demos, debates and the closing party." },
      ] },
      { type: "pricing", kicker: "Tickets", title: "Save your seat", tiers: [
        { name: "Student", price: "$99", period: "", features: ["All talks", "Recordings"], cta: "Buy" },
        { name: "General", price: "$349", period: "", features: ["All talks + workshops", "Lunch", "After-party"], cta: "Buy", featured: true },
        { name: "Pro", price: "$699", period: "", features: ["Everything", "Front rows", "Speaker dinner"], cta: "Buy" },
      ] },
      { type: "faq", kicker: "FAQ", title: "Good to know", items: [
        { q: "Are talks recorded?", a: "Yes — all ticket holders get recordings within 48 hours." },
        { q: "Is there a refund policy?", a: "Full refunds up to 30 days before the event." },
      ] },
      cta("Be in the room.", "Get tickets"),
    ],
  },
  {
    key: "landing",
    words: [],
    theme: "dark",
    pal: "acid",
    font: "grotesk",
    radius: "pill",
    nav: ["Product", "Features", "Pricing", "Contact"],
    build: ({ name, prompt }) => [
      { type: "hero", variant: "split", eyebrow: "Introducing", headline: name, sub: cap(prompt.trim() || `${name} — a living, scroll-driven experience generated from a single sentence.`), cta: "Get started", media: "3d" },
      marquee(["FAST", "BOLD", "REAL-TIME", "MADE WITH VOXEL", "ONE PROMPT"]),
      { type: "features", variant: "rows", kicker: "Why it works", title: "Built different", items: [
        { title: "One prompt, one site", body: "Describe it; watch it compose in real time." },
        { title: "Yours to shape", body: "Tune type, colour, motion and structure live." },
        { title: "Live in a click", body: "Publish to a real URL on the edge." },
      ] },
      { type: "stats", kicker: "By the numbers", items: [
        { value: "60s", label: "to a live site" }, { value: "3", label: "steps" }, { value: "100%", label: "real-time" },
      ] },
      { type: "testimonials", kicker: "People say", items: [
        { quote: "It made our site in the time it takes to write the brief.", author: "Dev Patel", role: "Founder" },
      ] },
      cta("Ready to make it unforgettable?", "Get started"),
    ],
  },
];

const DEFAULT_ARCHETYPE = ARCHETYPES[ARCHETYPES.length - 1];

function detectArchetype(text: string): Archetype {
  let best = DEFAULT_ARCHETYPE;
  let score = 0;
  for (const a of ARCHETYPES) {
    const s = a.words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    if (s > score) {
      score = s;
      best = a;
    }
  }
  return best;
}

function subjectOf(text: string): string {
  if (/photograph/.test(text)) return "Photographer";
  if (/illustrat/.test(text)) return "Illustrator";
  if (/design/.test(text)) return "Designer";
  if (/direct/.test(text)) return "Director";
  if (/develop|engineer/.test(text)) return "Developer";
  if (/architect/.test(text)) return "Architect";
  return "Multidisciplinary";
}

const INDUSTRY_IMAGE: Record<string, string> = {
  saas: "/cine/cyber.png", agency: "/cine/studio.png", wellness: "/cine/bloom.png",
  restaurant: "/cine/studio.png", commerce: "/cine/bloom.png", portfolio: "/cine/studio.png",
  event: "/cine/cyber.png", landing: "/cine/cyber.png",
};

/** Instant, deterministic, INTENT-AWARE SiteSpec — different prompts, different pages. */
export function generateSiteSpec(prompt: string): SiteSpec {
  const text = (prompt || "").toLowerCase();
  const seed = hash(prompt.trim() || "voxel");
  const arch = detectArchetype(text);
  const name = brandName(prompt, seed);
  const scene = generateScene(prompt);
  scene.palette = { ...scene.palette, a: PAL[arch.pal].a, b: PAL[arch.pal].b };

  const blocks = arch.build({ prompt, name, seed, subject: subjectOf(text) });
  const tagline = prompt.trim() ? cap(prompt.trim().replace(/\.$/, "")) : `Meet ${name}`;

  return {
    v: 3,
    archetype: arch.key,
    scene,
    image: INDUSTRY_IMAGE[arch.key] ?? "/cine/cyber.png",
    tokens: { theme: arch.theme, palette: PAL[arch.pal], font: arch.font, radius: arch.radius },
    brand: { name, tagline },
    nav: { links: arch.nav, cta: pick(["Get in touch", "Start", "Book", "Get started"], seed) },
    blocks,
    industry: arch.key,
    typeStyle: arch.font,
    theme: arch.theme,
  };
}

/** Type guard for stored configs. */
export function isSiteSpec(x: unknown): x is SiteSpec {
  return !!x && typeof x === "object" && (x as SiteSpec).v === 3 && Array.isArray((x as SiteSpec).blocks);
}

export const ALL_BLOCK_TYPES: BlockType[] = [
  "hero", "marquee", "logos", "statement", "features", "gallery", "menu",
  "steps", "stats", "team", "testimonials", "pricing", "faq", "cta", "contact",
];
