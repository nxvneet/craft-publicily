import type { SiteSpec, Section } from "./siteSpec";

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function sectionHtml(s: Section): string {
  if (s.hidden) return "";
  switch (s.type) {
    case "marquee":
      return `<div class="marquee"><div class="track">${[...s.items, ...s.items]
        .map((t) => `<span>${esc(t)} <em>✦</em></span>`)
        .join("")}</div></div>`;
    case "features":
      return `<section class="pad"><p class="kicker">${esc(s.kicker)}</p><h2>${esc(s.title)}</h2>
        <div class="grid2">${s.items
          .map((f, i) => `<div class="feat"><span class="num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></div>`)
          .join("")}</div></section>`;
    case "stats":
      return `<section class="pad"><p class="kicker">${esc(s.kicker)}</p>
        <div class="grid3">${s.items.map((x) => `<div><div class="stat">${esc(x.value)}</div><div class="lbl">${esc(x.label)}</div></div>`).join("")}</div></section>`;
    case "steps":
      return `<section class="pad"><p class="kicker">${esc(s.kicker)}</p><h2>${esc(s.title)}</h2>
        <div class="grid3">${s.items.map((x, i) => `<div class="card"><span class="badge">${i + 1}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div></section>`;
    case "showcase":
      return `<section class="pad"><p class="kicker">${esc(s.kicker)}</p><h2>${esc(s.title)}</h2>
        <div class="grid3">${s.items.map((x) => `<div class="show"><span class="tag">${esc(x.tag)}</span><h3>${esc(x.title)}</h3></div>`).join("")}</div></section>`;
    case "quote":
      return `<section class="pad center"><p class="quote">“${esc(s.quote)}”</p><p class="lbl">${esc(s.author)} — ${esc(s.role)}</p></section>`;
    case "cta":
      return `<section class="pad center tall"><h2 class="big">${esc(s.title)}</h2><a class="btn" href="#">${esc(s.button)} →</a></section>`;
    default:
      return "";
  }
}

/** Render a SiteSpec to a clean, standalone, responsive HTML document. */
export function exportHtml(spec: SiteSpec): string {
  const { a, b, bg } = spec.scene.palette;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(spec.brand.name)}</title>
<meta name="description" content="${esc(spec.brand.tagline)}"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--a:${a};--b:${b};--bg:${bg}}
body{background:var(--bg);color:#f4f1ea;font-family:'Space Grotesk',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.4}
.pad{padding:128px 24px;max-width:1200px;margin:0 auto}
.center{text-align:center}.tall{min-height:80vh;display:grid;place-items:center}
.kicker{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--a);margin-bottom:20px}
h1{font-size:clamp(48px,11vw,140px);line-height:.9;letter-spacing:-.04em;font-weight:600}
h2{font-size:clamp(32px,6vw,80px);line-height:.95;letter-spacing:-.03em;font-weight:600;max-width:760px}
h2.big{font-size:clamp(40px,8vw,120px)}
h3{font-size:24px;font-weight:600;letter-spacing:-.01em}
p{color:rgba(244,241,234,.65)}
.hero{min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px;background:radial-gradient(120% 80% at 30% 10%,${a}22,transparent 55%),radial-gradient(120% 90% at 80% 90%,${b}33,transparent 55%),var(--bg)}
.hero .sub{max-width:560px;margin:24px auto 0;font-size:18px}
.btn{display:inline-block;margin-top:36px;background:var(--a);color:#06060a;font-weight:600;padding:15px 30px;border-radius:999px;text-decoration:none}
.marquee{overflow:hidden;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:26px 0;white-space:nowrap}
.track{display:inline-block;animation:m 28s linear infinite}
.track span{font-size:36px;font-weight:600;color:rgba(244,241,234,.8);margin:0 28px}.track em{color:var(--a)}
@keyframes m{to{transform:translateX(-50%)}}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:56px;margin-top:64px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:64px}
.feat{border-top:1px solid rgba(255,255,255,.08);padding-top:24px}.feat .num{color:var(--a);font-family:monospace;font-size:14px;margin-right:16px}.feat p{margin-top:12px}
.stat{font-size:clamp(48px,8vw,96px);font-weight:600;letter-spacing:-.03em}.lbl{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,241,234,.5);margin-top:10px}
.card{border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:28px}.badge{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:999px;background:var(--a);color:#06060a;font-weight:600}.card h3{margin-top:18px}.card p{margin-top:8px}
.show{aspect-ratio:4/5;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(120% 90% at 30% 15%,${a}40,transparent 60%),var(--bg)}.show .tag{font-family:monospace;font-size:12px;text-transform:uppercase;color:var(--a)}
.quote{font-size:clamp(28px,5vw,52px);font-weight:600;letter-spacing:-.02em;max-width:880px;margin:0 auto}
footer{border-top:1px solid rgba(255,255,255,.08);padding:64px 24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;max-width:1200px;margin:0 auto;color:rgba(244,241,234,.5)}
@media(max-width:760px){.grid2,.grid3{grid-template-columns:1fr}}
</style></head>
<body>
<header class="hero"><div>
<p class="kicker">${esc(spec.hero.eyebrow)}</p>
<h1>${esc(spec.hero.headline)}</h1>
<p class="sub">${esc(spec.hero.sub)}</p>
<a class="btn" href="#">${esc(spec.hero.cta)} →</a>
</div></header>
${spec.sections.map(sectionHtml).join("\n")}
<footer><strong style="color:#f4f1ea;font-size:20px">${esc(spec.brand.name)}</strong><span>© ${esc(spec.brand.name)} · Generated with Voxel</span></footer>
</body></html>`;
}
