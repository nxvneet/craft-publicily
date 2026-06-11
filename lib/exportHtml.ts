import type { SiteSpec, Block } from "./siteSpec";

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function blockHtml(b: Block, accent: string): string {
  if (b.hidden) return "";
  const k = (s: string) => `<p class="kicker">${esc(s)}</p>`;
  switch (b.type) {
    case "hero":
      return `<header class="hero ${b.variant}"><div class="wrap">${k(b.eyebrow)}<h1>${esc(b.headline)}</h1><p class="sub">${esc(b.sub)}</p><a class="btn" href="#">${esc(b.cta)} →</a></div></header>`;
    case "marquee":
      return `<div class="marquee"><div class="track">${[...b.items, ...b.items].map((t) => `<span>${esc(t)} <em>✦</em></span>`).join("")}</div></div>`;
    case "logos":
      return `<div class="logos wrap"><span class="lbl">${esc(b.label)}</span>${b.items.map((l) => `<span>${esc(l)}</span>`).join("")}</div>`;
    case "statement":
      return `<section class="pad center"><h2 class="big">${esc(b.text)}</h2></section>`;
    case "features":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="grid3">${b.items.map((f, i) => `<div class="card"><span class="num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></div>`).join("")}</div></section>`;
    case "gallery":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="grid3">${b.items.map((c) => `<div class="show"><span class="tag">${esc(c.tag)}</span><h3>${esc(c.title)}</h3></div>`).join("")}</div></section>`;
    case "menu":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="menu">${b.items.map((m) => `<div class="row"><div><strong>${esc(m.name)}</strong><p>${esc(m.desc)}</p></div><span class="price">${esc(m.price)}</span></div>`).join("")}</div></section>`;
    case "steps":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="grid3">${b.items.map((s, i) => `<div><div class="bignum">${String(i + 1).padStart(2, "0")}</div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>`).join("")}</div></section>`;
    case "stats":
      return `<section class="pad">${k(b.kicker)}<div class="grid3">${b.items.map((s) => `<div><div class="stat">${esc(s.value)}</div><div class="lbl">${esc(s.label)}</div></div>`).join("")}</div></section>`;
    case "team":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="grid4">${b.items.map((m) => `<div class="card"><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p></div>`).join("")}</div></section>`;
    case "testimonials":
      return b.items.slice(0, 1).map((q) => `<section class="pad center"><p class="quote">“${esc(q.quote)}”</p><p class="lbl">${esc(q.author)} — ${esc(q.role)}</p></section>`).join("");
    case "pricing":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="grid3">${b.tiers.map((t) => `<div class="tier ${t.featured ? "feat" : ""}"><strong>${esc(t.name)}</strong><div class="price big">${esc(t.price)}<small>${esc(t.period)}</small></div><ul>${t.features.map((f) => `<li>✓ ${esc(f)}</li>`).join("")}</ul><a class="btn" href="#">${esc(t.cta)}</a></div>`).join("")}</div></section>`;
    case "faq":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><div class="faq">${b.items.map((f) => `<div class="qa"><strong>${esc(f.q)}</strong><p>${esc(f.a)}</p></div>`).join("")}</div></section>`;
    case "cta":
      return `<section class="pad center tall"><h2 class="big">${esc(b.title)}</h2><a class="btn" href="#">${esc(b.button)} →</a></section>`;
    case "contact":
      return `<section class="pad">${k(b.kicker)}<h2>${esc(b.title)}</h2><a class="email" href="mailto:${esc(b.email)}">${esc(b.email)}</a><p class="lbl">${esc(b.note)}</p></section>`;
    default:
      return "";
  }
}

/** Render a v3 SiteSpec to a clean, standalone, theme-aware HTML document. */
export function exportHtml(spec: SiteSpec): string {
  const { a, b } = spec.tokens.palette;
  const light = spec.tokens.theme === "light";
  const bg = spec.tokens.palette.bg;
  const ink = light ? "#0c0b0a" : "#f4f1ea";
  const sub = light ? "#57534c" : "rgba(244,241,234,.62)";
  const line = light ? "rgba(0,0,0,.13)" : "rgba(255,255,255,.12)";
  const on = "#0a0a0b";
  const serif = spec.tokens.font === "editorial";
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(spec.brand.name)}</title>
<meta name="description" content="${esc(spec.brand.tagline)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--a:${a};--b:${b};--bg:${bg};--ink:${ink};--sub:${sub};--line:${line}}
body{background:var(--bg);color:var(--ink);font-family:'Space Grotesk',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.5}
.wrap,.pad{max-width:1280px;margin:0 auto}
.pad{padding:112px 24px}.center{text-align:center}.tall{min-height:70vh;display:grid;place-items:center}
.kicker{font-family:monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--a);margin-bottom:20px}
h1{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:clamp(44px,9vw,120px);line-height:.92;letter-spacing:-.02em;font-weight:600}
h2{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:clamp(30px,5vw,56px);line-height:1.04;letter-spacing:-.02em;font-weight:600;max-width:820px}
h2.big{font-size:clamp(34px,6vw,72px)}h3{font-size:21px;font-weight:600}
p{color:var(--sub)}
.hero{padding:160px 24px 80px}.hero.centered,.hero.fullbleed{text-align:center}
.hero .sub{max-width:560px;margin:24px 0 0;font-size:19px}.hero.centered .sub{margin:24px auto 0}
.btn{display:inline-block;margin-top:32px;background:var(--a);color:${on};font-weight:500;padding:14px 28px;border-radius:999px;text-decoration:none}
.marquee{overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:24px 0;white-space:nowrap}
.track{display:inline-block;animation:m 26s linear infinite}.track span{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:34px;margin:0 24px}.track em{color:var(--a)}
@keyframes m{to{transform:translateX(-50%)}}
.logos{display:flex;flex-wrap:wrap;gap:14px 40px;justify-content:center;padding:48px 24px;border-bottom:1px solid var(--line);opacity:.6;font-family:monospace;font-size:13px;text-transform:uppercase;letter-spacing:.12em}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:56px}
.card{border:1px solid var(--line);border-radius:14px;padding:28px}.card .num{color:var(--a);font-family:monospace;font-size:13px}
.show{aspect-ratio:4/5;border:1px solid var(--line);border-radius:14px;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(160deg,${a}33,transparent 60%)}.show .tag{font-family:monospace;font-size:11px;text-transform:uppercase;color:var(--a)}
.menu{margin-top:48px}.menu .row{display:flex;justify-content:space-between;gap:24px;padding:18px 0;border-bottom:1px solid var(--line)}.menu .price{font-family:monospace;color:var(--a);font-size:18px}
.bignum{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:64px;color:var(--a)}
.stat{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:clamp(48px,8vw,88px);letter-spacing:-.03em;color:var(--a)}.lbl{font-family:monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--sub);margin-top:10px}
.quote{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:clamp(28px,5vw,52px);letter-spacing:-.01em;max-width:900px;margin:0 auto;line-height:1.12}
.tier{border:1px solid var(--line);border-radius:14px;padding:30px;display:flex;flex-direction:column}.tier.feat{border-color:var(--a);background:${a}10}.tier .price{font-size:44px;font-weight:600;margin:18px 0}.tier .price small{font-size:14px;color:var(--sub)}.tier ul{list-style:none;margin:8px 0 24px;flex:1}.tier li{padding:6px 0;color:var(--sub);font-size:14px}.tier .btn{margin-top:auto}
.faq .qa{padding:22px 0;border-top:1px solid var(--line)}.faq .qa p{margin-top:8px}
.email{font-family:${serif ? "'Instrument Serif',serif" : "inherit"};font-size:clamp(26px,5vw,44px);color:var(--a);display:inline-block;margin-top:24px;text-decoration:none}
footer{border-top:1px solid var(--line);padding:56px 24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;max-width:1280px;margin:0 auto;color:var(--sub);font-family:monospace;font-size:12px;text-transform:uppercase;letter-spacing:.12em}
@media(max-width:760px){.grid3,.grid4{grid-template-columns:1fr}}
</style></head>
<body>
${spec.blocks.map((blk) => blockHtml(blk, a)).join("\n")}
<footer><span>© ${esc(spec.brand.name)}</span><span>Generated with Voxel</span></footer>
</body></html>`;
}
