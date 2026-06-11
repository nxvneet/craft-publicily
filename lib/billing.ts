// Plan catalogue — display + entitlements. No secrets here (safe on the client).
// Stripe price IDs are resolved server-side from env (see /api/checkout).

export type PlanKey = "free" | "studio" | "pro" | "scale";

export type Plan = {
  key: PlanKey;
  name: string;
  price: number; // USD / month
  priceEnv: string | null; // env var holding the Stripe price id
  siteLimit: number; // Infinity for unlimited
  watermark: boolean; // show "Built with Voxel" badge
  codeExport: boolean;
  features: string[];
};

export const PLANS: Record<PlanKey, Plan> = {
  free: {
    key: "free",
    name: "Free",
    price: 0,
    priceEnv: null,
    siteLimit: 1,
    watermark: true,
    codeExport: false,
    features: ["1 live site", "voxel.site subdomain", "Real-time editor", "Watermark"],
  },
  studio: {
    key: "studio",
    name: "Studio",
    price: 19,
    priceEnv: "STRIPE_PRICE_STUDIO",
    siteLimit: 5,
    watermark: false,
    codeExport: false,
    features: ["5 sites", "Custom domain", "No watermark", "HD scene export", "Unlimited edits"],
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: 39,
    priceEnv: "STRIPE_PRICE_PRO",
    siteLimit: 20,
    watermark: false,
    codeExport: true,
    features: ["20 sites", "Code + ZIP export", "Own components", "Team handoff", "Priority render"],
  },
  scale: {
    key: "scale",
    name: "Scale",
    price: 129,
    priceEnv: "STRIPE_PRICE_SCALE",
    siteLimit: Infinity,
    watermark: false,
    codeExport: true,
    features: ["Unlimited sites", "White-label", "API access", "SSO + roles", "Dedicated support"],
  },
};

export const PLAN_ORDER: PlanKey[] = ["free", "studio", "pro", "scale"];

export function getPlan(key: string | null | undefined): Plan {
  return PLANS[(key as PlanKey) ?? "free"] ?? PLANS.free;
}
