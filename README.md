# Voxel — one prompt, a living 3D website

A first-draft, better-than-Draftly platform for generating and publishing
real-time 3D websites. Where [Draftly](https://www.draftly.space/) stitches
~400 extracted video frames into a scroll animation, Voxel renders a **live
WebGL scene** driven by scroll — sharper, lighter, editable after generation,
and shippable in **3 clicks**.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (type-checked)
```

## The flow (this is the whole funnel)

1. **Landing** (`/`) — type a sentence in the hero prompt box, hit Generate.
2. **Builder** (`/create?p=...`) — your scene is already rendered live. Tweak
   palette / form / motion / sliders, or refine in plain words
   ("make it darker & chrome"). Click **Publish**.
3. **Published site** (`/s/[id]?d=...`) — a real scroll-driven 3D site, shareable.

## How the "3D" works

- **Real-time R3F scene** (`components/Scene.tsx`): a central morphing form +
  instanced orbiting shards + sparkles + Lightformer-based reflections (no
  external HDRs, fully offline). Scroll position → real camera dolly/orbit.
- **Prompt → scene** (`lib/scenes.ts`): a deterministic, instant generator maps
  intent (mood, palette, geometry, motion) to a `SceneConfig`. This is the seam
  where a real model plugs in — an LLM for intent + a video/3D model
  (e.g. the Higgsfield pipeline) for bespoke assets.
- **Refine in words** (`lib/refine.ts`): keyword-driven live edits to the scene.

## Auth, persistence & real publishing

The app runs in **two modes**, switched automatically by env vars:

- **Local fallback (default, no setup):** anonymous identity in `localStorage`,
  Publish encodes the scene into the share URL (`/s/<id>?d=...`), and the
  dashboard lists locally-remembered sites. Everything works offline.
- **Live mode (set `NEXT_PUBLIC_SUPABASE_*`):** Supabase **anonymous auth**
  (zero-friction accounts), a `sites` table with **row-level security**, Publish
  inserts a row and returns a clean `/s/<id>` URL, `/s/[id]` is server-rendered
  from the DB, and `/dashboard` lists the signed-in user's sites.

Schema + policies live in `supabase/migrations/0001_sites.sql`.

## AI generation

- `POST /api/generate` turns a prompt into a `SceneConfig`. With
  `ANTHROPIC_API_KEY` set it uses **Claude (Haiku 4.5)** as the art director
  (palette, geometry, motion, mood); without a key it uses the instant
  deterministic generator. Either way the result is validated + clamped server-side.
- The builder runs one real AI pass on arrival and on every "regenerate".
- The preset gallery covers in `public/presets/*.webp` are **real
  Higgsfield-generated** art (nano-banana). The builder still renders each as a
  live, editable WebGL scene — the image is just the cover.

## Going live (one billing step)

A dedicated Supabase project is ready to be created but the **WatchTower org has
overdue invoices**, which blocks new projects. To switch on live mode:

1. Settle the invoices in the Supabase dashboard (org: WatchTower), **or** tell
   me to reuse one of your existing projects.
2. I create the `voxel` project + apply `0001_sites.sql` (free tier, $0/mo).
3. Drop the project URL + anon key into `.env.local` → live mode activates.
4. (Optional) add `ANTHROPIC_API_KEY` for Claude-backed generation.

## Billing (Stripe)

Pricing tiers live in `lib/billing.ts` (plan → price, site limit, watermark,
code-export). The flow is env-gated:

- **Demo mode (default):** pricing buttons open a "checkout is in demo mode"
  modal — the integration is fully wired, just keyless.
- **Live mode:** set `STRIPE_SECRET_KEY` + one recurring `STRIPE_PRICE_*` per
  paid plan → buttons open a real **Stripe Checkout** (`/api/checkout`). The
  **webhook** (`/api/stripe/webhook`, verified by `STRIPE_WEBHOOK_SECRET`)
  upserts the user's plan into `profiles` via the service role. Plan then drives
  entitlements — e.g. the "Built with Voxel" watermark disappears on paid plans
  (enforced server-side in `/s/[id]`).

To go live: create 3 recurring Prices in Stripe → fill the `STRIPE_*` env vars →
`stripe listen --forward-to localhost:3000/api/stripe/webhook` (or a dashboard
endpoint) for the signing secret → apply `supabase/migrations/0002_profiles.sql`.

## Subdomains (`<slug>.voxel.site`)

`middleware.ts` reads the `Host` header and rewrites `slug.<root>/` →
`/s/<slug>` (reserved subdomains like `www`/`app`/`api` are skipped). Verified
locally via `*.localhost`. To go live:

1. Set `NEXT_PUBLIC_ROOT_DOMAIN=voxel.site`.
2. Point a DNS **wildcard** `*.voxel.site` at the host, and add the wildcard
   domain in the host (e.g. Vercel) project settings.
3. With the live DB on, Publish then returns `https://<slug>.voxel.site`
   automatically (`lib/sites.ts`). (Subdomains need the DB, since the slug is
   looked up there — fallback mode keeps the `/s/<id>?d=...` share URL.)

## Stack

Next.js 15 (App Router) · React 19 · Three.js + @react-three/fiber + drei +
postprocessing (bloom/vignette) · Supabase (auth + Postgres + RLS) ·
Stripe (subscriptions + webhook) · host-based subdomain middleware ·
Tailwind v4 · Lenis · Motion · TypeScript.

## Remaining next steps

- The live Supabase DB (parked on the WatchTower invoice — see above).
- Pause off-screen WebGL contexts on low-end mobile (two canvases on the landing).
- Email/OAuth account upgrade on top of the anonymous session.
