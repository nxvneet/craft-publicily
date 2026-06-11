import { NextResponse } from "next/server";
import { generateSiteSpec, type SiteSpec, type Block, type Theme, type FontPair } from "@/lib/siteSpec";

export const runtime = "nodejs";

const isHex = (s: unknown): s is string => typeof s === "string" && /^#[0-9a-fA-F]{6}$/.test(s);
const str = (v: unknown, fb: string, max = 280) => (typeof v === "string" && v.trim() ? v.slice(0, max) : fb);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const o = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

// Claude is the designer/IA/copywriter: it COMPOSES a page from a block kit,
// choosing which blocks appear and in what order to fit the brief — so each
// prompt yields a different STRUCTURE, not a recolored template.
const SYSTEM = `You design a unique single-page website for a brief. You are an art director, information architect and copywriter for an award-winning studio. Return ONLY JSON (no prose).

Pick the blocks that fit the BRIEF and order them into a great page. A SaaS needs pricing+features; a restaurant needs a menu+hours; a portfolio needs a gallery; an event needs speakers+schedule. Do NOT include irrelevant blocks. 6–9 blocks total. The FIRST block must be a hero. End with a cta or contact.

Shape:
{
 "brand": {"name": string (short, brandable), "tagline": string},
 "design": {"a": hex accent, "b": hex secondary, "bg": hex base (dark theme = very dark; light theme = warm near-white like #f4f1ea), "theme": "light"|"dark", "font": "grotesk"|"editorial"|"mono"|"display", "radius": "sharp"|"soft"|"pill"},
 "nav": {"links": [3-4 short words], "cta": string},
 "blocks": [ ordered blocks, each one of:
   {"type":"hero","variant":"split"|"centered"|"fullbleed"|"editorial","eyebrow":str,"headline":str (punchy, <=5 words),"sub":str (1 sentence),"cta":str,"media":"3d"|"image"|"none"},
   {"type":"marquee","items":[5-6 ALLCAPS words]},
   {"type":"logos","label":str,"items":[5-6 names]},
   {"type":"statement","text":str (one bold editorial sentence)},
   {"type":"features","variant":"rows"|"grid"|"bento","kicker":str,"title":str,"items":[3-4 {"title":str,"body":str}]},
   {"type":"gallery","variant":"masonry"|"grid","kicker":str,"title":str,"items":[3-5 {"title":str,"tag":str}]},
   {"type":"menu","kicker":str,"title":str,"items":[4-6 {"name":str,"price":str,"desc":str}]},
   {"type":"steps","kicker":str,"title":str,"items":[3 {"title":str,"body":str}]},
   {"type":"stats","kicker":str,"items":[3 {"value":str,"label":str}]},
   {"type":"team","kicker":str,"title":str,"items":[3-4 {"name":str,"role":str}]},
   {"type":"testimonials","kicker":str,"items":[1-2 {"quote":str,"author":str,"role":str}]},
   {"type":"pricing","kicker":str,"title":str,"tiers":[3 {"name":str,"price":str,"period":str,"features":[3-4 str],"cta":str,"featured":bool}]},
   {"type":"faq","kicker":str,"title":str,"items":[3-4 {"q":str,"a":str}]},
   {"type":"cta","title":str,"button":str},
   {"type":"contact","kicker":str,"title":str,"email":str,"note":str}
 ]
}
Write real, specific, confident copy tailored to the brief — never lorem, never generic filler. Match theme/palette/font to the brand's emotion (editorial serif for studios/restaurants, grotesk for tech, display for bold brands).`;

const HERO_VARIANTS = ["split", "centered", "fullbleed", "editorial"];
const MEDIA = ["3d", "image", "none"];

function validBlocks(raw: unknown, fallback: Block[]): Block[] {
  const out: Block[] = [];
  for (const r of arr(raw)) {
    const b = o(r);
    const type = b.type;
    try {
      switch (type) {
        case "hero":
          out.push({ type: "hero", variant: (HERO_VARIANTS.includes(b.variant as string) ? b.variant : "split") as "split", eyebrow: str(b.eyebrow, "Introducing", 40), headline: str(b.headline, "Make it unforgettable", 60), sub: str(b.sub, "", 200), cta: str(b.cta, "Get started", 24), media: (MEDIA.includes(b.media as string) ? b.media : "3d") as "3d" }); break;
        case "marquee":
          out.push({ type: "marquee", items: arr(b.items).slice(0, 8).map((x) => str(x, "", 24)).filter(Boolean) }); break;
        case "logos":
          out.push({ type: "logos", label: str(b.label, "Trusted by", 40), items: arr(b.items).slice(0, 8).map((x) => str(x, "", 24)).filter(Boolean) }); break;
        case "statement":
          out.push({ type: "statement", text: str(b.text, "", 220) }); break;
        case "features":
          out.push({ type: "features", variant: (["rows", "grid", "bento"].includes(b.variant as string) ? b.variant : "grid") as "grid", kicker: str(b.kicker, "Why it works", 40), title: str(b.title, "What we do", 80), items: arr(b.items).slice(0, 4).map((x) => ({ title: str(o(x).title, "Feature", 60), body: str(o(x).body, "", 200) })) }); break;
        case "gallery":
          out.push({ type: "gallery", variant: (["masonry", "grid"].includes(b.variant as string) ? b.variant : "grid") as "grid", kicker: str(b.kicker, "Selected", 40), title: str(b.title, "Work", 80), items: arr(b.items).slice(0, 6).map((x) => ({ title: str(o(x).title, "Project", 50), tag: str(o(x).tag, "", 24) })) }); break;
        case "menu":
          out.push({ type: "menu", kicker: str(b.kicker, "Menu", 40), title: str(b.title, "What we serve", 80), items: arr(b.items).slice(0, 8).map((x) => ({ name: str(o(x).name, "Dish", 60), price: str(o(x).price, "", 10), desc: str(o(x).desc, "", 120) })) }); break;
        case "steps":
          out.push({ type: "steps", kicker: str(b.kicker, "How it works", 40), title: str(b.title, "Three steps", 80), items: arr(b.items).slice(0, 3).map((x) => ({ title: str(o(x).title, "Step", 40), body: str(o(x).body, "", 160) })) }); break;
        case "stats":
          out.push({ type: "stats", kicker: str(b.kicker, "By the numbers", 40), items: arr(b.items).slice(0, 3).map((x) => ({ value: str(o(x).value, "—", 12), label: str(o(x).label, "", 40) })) }); break;
        case "team":
          out.push({ type: "team", kicker: str(b.kicker, "Team", 40), title: str(b.title, "Who we are", 80), items: arr(b.items).slice(0, 4).map((x) => ({ name: str(o(x).name, "Name", 40), role: str(o(x).role, "", 40) })) }); break;
        case "testimonials":
          out.push({ type: "testimonials", kicker: str(b.kicker, "Praise", 40), items: arr(b.items).slice(0, 2).map((x) => ({ quote: str(o(x).quote, "", 240), author: str(o(x).author, "Anon", 40), role: str(o(x).role, "", 60) })) }); break;
        case "pricing":
          out.push({ type: "pricing", kicker: str(b.kicker, "Pricing", 40), title: str(b.title, "Plans", 80), tiers: arr(b.tiers).slice(0, 3).map((x) => { const xx = o(x); return { name: str(xx.name, "Plan", 30), price: str(xx.price, "$0", 12), period: str(xx.period, "", 12), features: arr(xx.features).slice(0, 5).map((f) => str(f, "", 60)).filter(Boolean), cta: str(xx.cta, "Choose", 24), featured: !!xx.featured }; }) }); break;
        case "faq":
          out.push({ type: "faq", kicker: str(b.kicker, "FAQ", 40), title: str(b.title, "Questions", 80), items: arr(b.items).slice(0, 5).map((x) => ({ q: str(o(x).q, "", 120), a: str(o(x).a, "", 240) })) }); break;
        case "cta":
          out.push({ type: "cta", title: str(b.title, "Ready?", 90), button: str(b.button, "Get started", 24) }); break;
        case "contact":
          out.push({ type: "contact", kicker: str(b.kicker, "Contact", 40), title: str(b.title, "Get in touch", 80), email: str(b.email, "hello@studio.com", 60), note: str(b.note, "", 120) }); break;
      }
    } catch { /* skip malformed */ }
  }
  const hasHero = out.some((b) => b.type === "hero");
  return out.length >= 4 && hasHero ? out : fallback;
}

export async function POST(req: Request) {
  let prompt = "";
  try { ({ prompt } = await req.json()); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  prompt = String(prompt || "").slice(0, 400);

  const base = generateSiteSpec(prompt);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !prompt.trim()) return NextResponse.json({ spec: base, source: "deterministic" });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, system: SYSTEM, messages: [{ role: "user", content: `Brief: "${prompt}"` }] }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const j = o(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)));
    const d = o(j.design);
    const nav = o(j.nav);
    const theme: Theme = d.theme === "light" ? "light" : "dark";
    const font: FontPair = (["grotesk", "editorial", "mono", "display"].includes(d.font as string) ? d.font : base.tokens.font) as FontPair;

    const spec: SiteSpec = {
      ...base,
      scene: { ...base.scene, palette: { ...base.scene.palette, a: isHex(d.a) ? d.a : base.scene.palette.a, b: isHex(d.b) ? d.b : base.scene.palette.b } },
      tokens: {
        theme, font,
        radius: (["sharp", "soft", "pill"].includes(d.radius as string) ? d.radius : base.tokens.radius) as "soft",
        palette: { bg: isHex(d.bg) ? d.bg : (theme === "light" ? "#f4f1ea" : base.tokens.palette.bg), a: isHex(d.a) ? d.a : base.tokens.palette.a, b: isHex(d.b) ? d.b : base.tokens.palette.b },
      },
      brand: { name: str(o(j.brand).name, base.brand.name, 32), tagline: str(o(j.brand).tagline, base.brand.tagline, 80) },
      nav: { links: arr(nav.links).slice(0, 5).map((x) => str(x, "", 20)).filter(Boolean).length ? arr(nav.links).slice(0, 5).map((x) => str(x, "", 20)).filter(Boolean) : base.nav.links, cta: str(nav.cta, base.nav.cta, 24) },
      blocks: validBlocks(j.blocks, base.blocks),
      theme,
      typeStyle: font,
    };
    return NextResponse.json({ spec, source: "claude" });
  } catch {
    return NextResponse.json({ spec: base, source: "deterministic-fallback" });
  }
}
