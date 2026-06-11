import { NextResponse } from "next/server";
import { generateSiteSpec, type SiteSpec, type Section } from "@/lib/siteSpec";
import type { Geometry, Motion } from "@/lib/scenes";

export const runtime = "nodejs";

const GEOMS = ["orb", "crystal", "torus", "monolith", "wave"];
const MOTIONS = ["calm", "orbit", "kinetic"];
const isHex = (s: unknown): s is string => typeof s === "string" && /^#[0-9a-fA-F]{6}$/.test(s);
const str = (v: unknown, fb: string, max = 240) => (typeof v === "string" && v.trim() ? v.slice(0, max) : fb);

// Claude acts as brand strategist + copywriter + art director, returning JSON
// we validate and merge onto the deterministic base (which guarantees shape).
const SYSTEM = `You are a brand strategist, conversion copywriter and art director for an award-winning web studio. Given a brief, design a single-scroll landing page. Return ONLY JSON, no prose:
{
 "brand": {"name": string (short, brandable), "tagline": string},
 "design": {"a": hex accent, "b": hex secondary, "bg": hex very-dark, "theme": one of ["light","dark"] (light = refined editorial on warm paper; dark = cinematic gallery), "geometry": one of ["orb","crystal","torus","monolith","wave"], "motion": one of ["calm","orbit","kinetic"], "typeStyle": one of ["grotesk","editorial","mono","display"]},
 "hero": {"eyebrow": string (2-4 words), "headline": string (punchy, <=6 words), "sub": string (one sentence), "cta": string (1-3 words)},
 "sections": [
   {"type":"marquee","items":[6 short ALL-CAPS phrases]},
   {"type":"features","kicker":string,"title":string,"items":[3-4 {"title":string,"body":string (1 sentence, specific & vivid)}]},
   {"type":"stats","kicker":string,"items":[3 {"value":string,"label":string}]},
   {"type":"steps","kicker":string,"title":string,"items":[3 {"title":string,"body":string}]},
   {"type":"quote","quote":string,"author":string,"role":string},
   {"type":"cta","title":string,"button":string}
 ]
}
Write real, specific, confident copy — never lorem ipsum, never generic filler. Match tone and palette to the brand's emotion.`;

function validSections(raw: unknown, fallback: Section[]): Section[] {
  if (!Array.isArray(raw)) return fallback;
  const out: Section[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const t = (r as { type?: string }).type;
    const a = (r as { items?: unknown }).items;
    try {
      if (t === "marquee" && Array.isArray(a)) out.push({ type: "marquee", items: a.slice(0, 8).map(String) });
      else if (t === "features" && Array.isArray(a))
        out.push({ type: "features", kicker: str((r as any).kicker, "Why it works", 40), title: str((r as any).title, "Built different", 80), items: a.slice(0, 4).map((x: any) => ({ title: str(x?.title, "Feature", 60), body: str(x?.body, "", 200) })) });
      else if (t === "stats" && Array.isArray(a))
        out.push({ type: "stats", kicker: str((r as any).kicker, "By the numbers", 40), items: a.slice(0, 3).map((x: any) => ({ value: str(x?.value, "—", 12), label: str(x?.label, "", 40) })) });
      else if (t === "steps" && Array.isArray(a))
        out.push({ type: "steps", kicker: str((r as any).kicker, "How it works", 40), title: str((r as any).title, "Three steps", 80), items: a.slice(0, 3).map((x: any) => ({ title: str(x?.title, "Step", 40), body: str(x?.body, "", 160) })) });
      else if (t === "showcase" && Array.isArray(a))
        out.push({ type: "showcase", kicker: str((r as any).kicker, "Explore", 40), title: str((r as any).title, "A closer look", 80), items: a.slice(0, 3).map((x: any) => ({ title: str(x?.title, "Item", 40), tag: str(x?.tag, "", 24) })) });
      else if (t === "quote") out.push({ type: "quote", quote: str((r as any).quote, "", 240), author: str((r as any).author, "Anon", 40), role: str((r as any).role, "", 60) });
      else if (t === "cta") out.push({ type: "cta", title: str((r as any).title, "Ready?", 80), button: str((r as any).button, "Get started", 24) });
    } catch {
      /* skip malformed section */
    }
  }
  return out.length >= 3 ? out : fallback;
}

export async function POST(req: Request) {
  let prompt = "";
  try {
    ({ prompt } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  prompt = String(prompt || "").slice(0, 400);

  const base = generateSiteSpec(prompt); // deterministic base / merge target
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !prompt.trim()) {
    return NextResponse.json({ spec: base, source: "deterministic" });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1600,
        system: SYSTEM,
        messages: [{ role: "user", content: `Brief: "${prompt}"` }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));

    const spec: SiteSpec = {
      ...base,
      scene: {
        ...base.scene,
        palette: {
          ...base.scene.palette,
          a: isHex(j?.design?.a) ? j.design.a : base.scene.palette.a,
          b: isHex(j?.design?.b) ? j.design.b : base.scene.palette.b,
          bg: isHex(j?.design?.bg) ? j.design.bg : base.scene.palette.bg,
        },
        geometry: GEOMS.includes(j?.design?.geometry) ? (j.design.geometry as Geometry) : base.scene.geometry,
        motion: MOTIONS.includes(j?.design?.motion) ? (j.design.motion as Motion) : base.scene.motion,
      },
      typeStyle: ["grotesk", "editorial", "mono", "display"].includes(j?.design?.typeStyle) ? j.design.typeStyle : base.typeStyle,
      theme: j?.design?.theme === "light" || j?.design?.theme === "dark" ? j.design.theme : base.theme,
      brand: { name: str(j?.brand?.name, base.brand.name, 32), tagline: str(j?.brand?.tagline, base.brand.tagline, 80) },
      hero: {
        eyebrow: str(j?.hero?.eyebrow, base.hero.eyebrow, 40),
        headline: str(j?.hero?.headline, base.hero.headline, 60),
        sub: str(j?.hero?.sub, base.hero.sub, 200),
        cta: str(j?.hero?.cta, base.hero.cta, 24),
      },
      sections: validSections(j?.sections, base.sections),
    };

    return NextResponse.json({ spec, source: "claude" });
  } catch {
    return NextResponse.json({ spec: base, source: "deterministic-fallback" });
  }
}
