// ─────────────────────────────────────────────────────────────────────────
// SiteSpec — the structured website definition the whole product renders.
//
// Mirrors how real prompt→site systems (Relume, v0, Lovable) work:
//   intent → information architecture (sections) → copywriting → design tokens.
// The LLM (see /api/generate) emits this shape as schema-validated JSON; the
// deterministic generator below produces a solid version instantly with no key.
// ─────────────────────────────────────────────────────────────────────────

import { generateScene, type SceneConfig } from "./scenes";

export type TypeStyle = "grotesk" | "editorial" | "mono" | "display";

type Hideable = { hidden?: boolean };
export type Section =
  | ({ type: "marquee"; items: string[] } & Hideable)
  | ({ type: "features"; kicker: string; title: string; items: { title: string; body: string }[] } & Hideable)
  | ({ type: "stats"; kicker: string; items: { value: string; label: string }[] } & Hideable)
  | ({ type: "steps"; kicker: string; title: string; items: { title: string; body: string }[] } & Hideable)
  | ({ type: "showcase"; kicker: string; title: string; items: { title: string; tag: string }[] } & Hideable)
  | ({ type: "quote"; quote: string; author: string; role: string } & Hideable)
  | ({ type: "cta"; title: string; button: string } & Hideable);

export type SiteSpec = {
  v: 2;
  scene: SceneConfig;
  image: string; // cinematic WebGL hero environment (depth-parallax)
  industry: string;
  typeStyle: TypeStyle;
  brand: { name: string; tagline: string };
  hero: { eyebrow: string; headline: string; sub: string; cta: string };
  sections: Section[];
};

// Industry → cinematic hero environment (rendered as live depth-parallax WebGL).
// In production a model generates a bespoke image per prompt; these are the
// baked, AI-generated (Higgsfield) defaults that ship today.
const INDUSTRY_IMAGE: Record<string, string> = {
  ai: "/cine/cyber.png",
  saas: "/cine/cyber.png",
  finance: "/cine/cyber.png",
  studio: "/cine/studio.png",
  wellness: "/cine/bloom.png",
  commerce: "/cine/bloom.png",
};

// ── industry vocabularies ──────────────────────────────────────────────────
type Industry = {
  key: string;
  words: string[];
  type: TypeStyle;
  nouns: string[]; // the "thing" the brand makes
  benefits: string[];
  features: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  showcase: { title: string; tag: string }[];
  quote: { quote: string; author: string; role: string };
  marquee: string[];
};

const INDUSTRIES: Industry[] = [
  {
    key: "saas",
    words: ["saas", "platform", "software", "tool", "dashboard", "workflow", "productivity", "developer", "api"],
    type: "grotesk",
    nouns: ["the platform", "the workspace", "the product"],
    benefits: ["ship faster", "stay in flow", "scale without friction"],
    features: [
      { title: "Built for speed", body: "Everything is one keystroke away. No loading spinners, no context-switching — just momentum." },
      { title: "Plays well with your stack", body: "Native integrations and a clean API mean it slots into the tools your team already lives in." },
      { title: "Secure by default", body: "SOC 2, SSO, and granular roles out of the box. Enterprise-ready from day one." },
      { title: "Insight that compounds", body: "Real-time analytics surface what matters, so every decision is backed by data." },
    ],
    steps: [
      { title: "Connect", body: "Link your sources in a click. We handle the plumbing." },
      { title: "Configure", body: "Tune it to your workflow with sensible defaults." },
      { title: "Ship", body: "Go live in minutes and iterate without fear." },
    ],
    stats: [
      { value: "10×", label: "faster to launch" },
      { value: "99.99%", label: "uptime SLA" },
      { value: "40k+", label: "teams onboarded" },
    ],
    showcase: [
      { title: "Automations", tag: "Workflow" },
      { title: "Live analytics", tag: "Insight" },
      { title: "Open API", tag: "Developer" },
    ],
    quote: { quote: "It replaced four tools and made our team feel twice as fast.", author: "Maya Chen", role: "VP Engineering, Northwind" },
    marquee: ["FAST", "SECURE", "SCALABLE", "OPEN API", "REAL-TIME", "BUILT TO SHIP"],
  },
  {
    key: "ai",
    words: ["ai", "agent", "neural", "model", "intelligence", "automation", "ml", "copilot", "gpt"],
    type: "mono",
    nouns: ["the engine", "the agent", "the model"],
    benefits: ["think faster", "automate the busywork", "see around corners"],
    features: [
      { title: "Reasoning, not guessing", body: "A model that explains itself — every output is grounded, traceable, and yours to audit." },
      { title: "Runs where you do", body: "Cloud, on-prem, or edge. Your data never leaves your perimeter unless you say so." },
      { title: "Improves with use", body: "It learns your patterns and gets sharper every session — without you lifting a finger." },
      { title: "Human in the loop", body: "Approve, correct, or override. The agent works for you, never around you." },
    ],
    steps: [
      { title: "Describe", body: "Tell it the outcome you want in plain language." },
      { title: "Delegate", body: "It plans, acts, and checks its own work." },
      { title: "Review", body: "Approve the result or steer it in one line." },
    ],
    stats: [
      { value: "92%", label: "tasks fully automated" },
      { value: "<200ms", label: "median latency" },
      { value: "12M", label: "decisions / day" },
    ],
    showcase: [
      { title: "Autonomous agents", tag: "Automate" },
      { title: "Grounded answers", tag: "Trust" },
      { title: "Custom models", tag: "Adapt" },
    ],
    quote: { quote: "It does in seconds what used to take my team an afternoon.", author: "Dev Patel", role: "Head of Ops, Lumen" },
    marquee: ["AUTONOMOUS", "GROUNDED", "PRIVATE", "REAL-TIME", "SELF-IMPROVING", "YOURS"],
  },
  {
    key: "commerce",
    words: ["shop", "store", "ecommerce", "product", "drink", "brand", "fashion", "sneaker", "launch", "retail"],
    type: "display",
    nouns: ["the drop", "the product", "the line"],
    benefits: ["turn heads", "sell out the drop", "build a cult following"],
    features: [
      { title: "Made to be felt", body: "Every detail engineered for the moment it lands in your hands." },
      { title: "Limited by design", body: "Small batches, big presence. When it's gone, it's gone." },
      { title: "Ships in 48 hours", body: "Carbon-neutral delivery, tracked end to end, no surprises." },
      { title: "Loved out loud", body: "Thousands of five-star reviews and a community that keeps coming back." },
    ],
    steps: [
      { title: "Choose", body: "Pick your size, your colourway, your statement." },
      { title: "Checkout", body: "One tap. Apple Pay, Shop Pay, done." },
      { title: "Flex", body: "It arrives in days. The rest is up to you." },
    ],
    stats: [
      { value: "4.9★", label: "average rating" },
      { value: "60k+", label: "units shipped" },
      { value: "48h", label: "to your door" },
    ],
    showcase: [
      { title: "The signature", tag: "Bestseller" },
      { title: "Limited drop", tag: "New" },
      { title: "The essentials", tag: "Everyday" },
    ],
    quote: { quote: "Easily the best thing I've bought all year. The packaging alone.", author: "Jordan Vela", role: "Verified buyer" },
    marquee: ["NEW DROP", "LIMITED", "FREE RETURNS", "SHIPS FAST", "5-STAR", "SOLD OUT SOON"],
  },
  {
    key: "studio",
    words: ["studio", "agency", "design", "creative", "architecture", "brand", "portfolio", "art", "film"],
    type: "editorial",
    nouns: ["the studio", "the practice", "the work"],
    benefits: ["make it unforgettable", "earn the double-take", "set the standard"],
    features: [
      { title: "Ideas with teeth", body: "We don't decorate problems — we dismantle them and rebuild something sharper." },
      { title: "Craft, obsessively", body: "Every pixel, frame and word is argued over until it earns its place." },
      { title: "Partners, not vendors", body: "We sit on your side of the table and stay long after launch." },
    ],
    steps: [
      { title: "Listen", body: "We start with the awkward questions nobody else asks." },
      { title: "Make", body: "We prototype in public and kill our darlings fast." },
      { title: "Ship", body: "We launch loud and measure what actually moved." },
    ],
    stats: [
      { value: "30+", label: "awards won" },
      { value: "120", label: "brands shaped" },
      { value: "15yr", label: "of making" },
    ],
    showcase: [
      { title: "Identity", tag: "Brand" },
      { title: "Motion", tag: "Film" },
      { title: "Spatial", tag: "Architecture" },
    ],
    quote: { quote: "They gave us a brand people actually screenshot. Sales followed.", author: "Lena Ortiz", role: "Founder, Atelier Nine" },
    marquee: ["AWARD-WINNING", "BOLD", "MADE BY HAND", "NO TEMPLATES", "SINCE 2009", "STUDIO"],
  },
  {
    key: "wellness",
    words: ["wellness", "health", "skincare", "care", "calm", "meditation", "fitness", "beauty", "mind", "bloom"],
    type: "editorial",
    nouns: ["the ritual", "the practice", "the line"],
    benefits: ["feel like yourself again", "slow down on purpose", "glow from within"],
    features: [
      { title: "Backed by science", body: "Clinically-studied ingredients, nothing you can't pronounce, results you can see." },
      { title: "Kind to everything", body: "Cruelty-free, reef-safe, and packaged to leave the planet better than we found it." },
      { title: "A ritual, not a chore", body: "Designed to be the best ninety seconds of your morning." },
    ],
    steps: [
      { title: "Breathe", body: "Begin with one slow, intentional moment." },
      { title: "Apply", body: "A little goes a long way. Let it absorb." },
      { title: "Glow", body: "Show up to your day as the calmest person in the room." },
    ],
    stats: [
      { value: "97%", label: "saw results in 2 weeks" },
      { value: "0", label: "nasties, ever" },
      { value: "1M+", label: "rituals a month" },
    ],
    showcase: [
      { title: "The serum", tag: "Hero" },
      { title: "The ritual set", tag: "Bundle" },
      { title: "The daily", tag: "Everyday" },
    ],
    quote: { quote: "Three weeks in and my skin — and honestly my mood — is different.", author: "Sana Iqbal", role: "Verified member" },
    marquee: ["CLEAN", "CLINICAL", "CRUELTY-FREE", "MADE TO LAST", "FEEL IT", "RITUAL"],
  },
  {
    key: "finance",
    words: ["fintech", "finance", "bank", "payment", "money", "crypto", "invest", "wallet", "trading"],
    type: "grotesk",
    nouns: ["the account", "the app", "the network"],
    benefits: ["take control of your money", "move money like a message", "grow without guesswork"],
    features: [
      { title: "Your money, in motion", body: "Instant transfers, real-time balances, zero hidden fees. Finally, finance that keeps up." },
      { title: "Safe as houses", body: "Bank-grade encryption, biometric locks, and funds insured to the last cent." },
      { title: "Grow on autopilot", body: "Round-ups, smart pots and yield that works while you sleep." },
    ],
    steps: [
      { title: "Open", body: "Sign up in three minutes. No paperwork, no branch." },
      { title: "Fund", body: "Top up from any account, instantly." },
      { title: "Grow", body: "Spend, save and invest from one beautiful place." },
    ],
    stats: [
      { value: "$0", label: "monthly fees" },
      { value: "4.6%", label: "APY on savings" },
      { value: "2M+", label: "accounts opened" },
    ],
    showcase: [
      { title: "Spend", tag: "Card" },
      { title: "Save", tag: "Vaults" },
      { title: "Invest", tag: "Markets" },
    ],
    quote: { quote: "I closed three apps the week I switched. It just does everything.", author: "Tomás Rivera", role: "Member since 2024" },
    marquee: ["NO FEES", "INSURED", "INSTANT", "SECURE", "REAL YIELD", "MOVE MONEY"],
  },
];

const DEFAULT_INDUSTRY = INDUSTRIES[0];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function detectIndustry(text: string): Industry {
  let best = DEFAULT_INDUSTRY;
  let score = 0;
  for (const ind of INDUSTRIES) {
    const s = ind.words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    if (s > score) {
      score = s;
      best = ind;
    }
  }
  return best;
}

function brandName(prompt: string, seed: number): string {
  // prefer a Capitalised word the user wrote; else a coined name.
  const capWord = prompt.split(/\s+/).find((w) => /^[A-Z][a-zA-Z]{2,}$/.test(w));
  if (capWord) return capWord;
  const coined = ["Atlas", "Nova", "Halo", "Vela", "Orbit", "Lumen", "Forge", "Drift", "Onyx", "Kit", "Aero", "Pulse"];
  return coined[Math.abs(seed) % coined.length];
}

/** Instant, deterministic SiteSpec — the zero-latency fallback. */
export function generateSiteSpec(prompt: string): SiteSpec {
  const text = (prompt || "").toLowerCase();
  const seed = hash(prompt.trim() || "voxel");
  const scene = generateScene(prompt);
  const ind = detectIndustry(text);
  const name = brandName(prompt, seed);
  const benefit = ind.benefits[Math.abs(seed) % ind.benefits.length];
  const noun = ind.nouns[Math.abs(seed >> 3) % ind.nouns.length];

  const headline = cap(`${benefit}.`);
  const tagline = prompt.trim() ? cap(prompt.trim().replace(/\.$/, "")) : `Meet ${name}`;

  const sections: Section[] = [
    { type: "marquee", items: ind.marquee },
    {
      type: "features",
      kicker: "Why it works",
      title: `Everything ${noun} should be`,
      items: ind.features,
    },
    { type: "stats", kicker: "By the numbers", items: ind.stats },
    {
      type: "steps",
      kicker: "How it works",
      title: "Live in three steps",
      items: ind.steps,
    },
    {
      type: "showcase",
      kicker: "Explore",
      title: "A closer look",
      items: ind.showcase,
    },
    { type: "quote", ...ind.quote },
    { type: "cta", title: `Ready to ${benefit.replace(/\.$/, "")}?`, button: "Get started" },
  ];

  return {
    v: 2,
    scene,
    image: INDUSTRY_IMAGE[ind.key] ?? "/cine/bloom.png",
    industry: ind.key,
    typeStyle: ind.type,
    brand: { name, tagline },
    hero: {
      eyebrow: `${cap(ind.key)} · ${scene.geometry}`,
      headline,
      sub: `${name} helps you ${benefit.replace(/\.$/, "")} — a real-time, scroll-driven experience generated from a single sentence.`,
      cta: "Get started",
    },
    sections,
  };
}

/** Type guard for stored configs (old SceneConfig vs new SiteSpec). */
export function isSiteSpec(x: unknown): x is SiteSpec {
  return !!x && typeof x === "object" && (x as SiteSpec).v === 2 && Array.isArray((x as SiteSpec).sections);
}
