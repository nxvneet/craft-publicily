"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { SceneCanvas } from "./SceneCanvas";
import type { SiteSpec, Block, Tokens } from "@/lib/siteSpec";
import { featureImages, showcaseImages, heroImage } from "@/lib/siteImages";

const EASE = [0.16, 1, 0.3, 1] as const;
const NOANIM = false;

function seedOf(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function lum(hex: string) { const h = hex.replace("#", ""); return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255; }

type T = {
  bg: string; ink: string; sub: string; line: string; card: string; inv: string; invInk: string;
  accent: string; on: string; light: boolean; rad: string; btn: string; head: string; serif: boolean;
};
function theme(tk: Tokens): T {
  const accent = tk.palette.a;
  const light = tk.theme === "light";
  const on = lum(accent) > 0.62 ? "#0a0a0b" : "#ffffff";
  const rad = tk.radius === "sharp" ? "0px" : tk.radius === "pill" ? "20px" : "14px";
  const btn = tk.radius === "sharp" ? "2px" : "9999px";
  const head = tk.font === "editorial" ? "font-serif" : tk.font === "mono" ? "font-mono" : "font-display";
  return light
    ? { bg: tk.palette.bg, ink: "#0c0b0a", sub: "#57534c", line: "rgba(0,0,0,0.13)", card: "#ffffff", inv: "#0c0b0a", invInk: tk.palette.bg, accent, on, light: true, rad, btn, head, serif: tk.font === "editorial" }
    : { bg: tk.palette.bg, ink: "#f4f1ea", sub: "rgba(244,241,234,0.62)", line: "rgba(255,255,255,0.12)", card: "rgba(255,255,255,0.04)", inv: "#f4f1ea", invInk: tk.palette.bg, accent, on, light: false, rad, btn, head, serif: tk.font === "editorial" };
}

function Up({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  return (
    <motion.div ref={ref} className={className} initial={NOANIM ? false : { y: 32, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.85, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

function Head({ text, t, className }: { text: string; t: T; className?: string }) {
  if (!t.serif) return <h2 className={className}>{text}</h2>;
  const w = text.trim().split(/\s+/); const last = w.pop() ?? "";
  return <h2 className={className}>{w.join(" ")} {w.length ? " " : ""}<span className="italic" style={{ color: t.accent }}>{last}</span></h2>;
}

/* hero headline: serif themes get an italic accent word; others stay solid */
function HeroHeadline({ text, t, className }: { text: string; t: T; className?: string }) {
  if (!t.serif) return <h1 className={className}>{text}</h1>;
  const w = text.trim().split(/\s+/); const last = w.pop() ?? "";
  return <h1 className={className}>{w.join(" ")} {w.length ? " " : ""}<span className="italic" style={{ color: t.accent }}>{last}</span></h1>;
}

export function SiteRenderer({ spec, watermark = true }: { spec: SiteSpec; watermark?: boolean }) {
  if (!Array.isArray((spec as SiteSpec).blocks)) {
    return <main className="grid min-h-screen place-items-center bg-ink text-cream">Regenerate to preview.</main>;
  }
  const t = theme(spec.tokens);
  const seed = seedOf(spec.brand.name + spec.archetype);
  const Kicker = ({ children }: { children: React.ReactNode }) => <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: t.accent }}>{children}</p>;
  const h2 = `${t.head} text-[clamp(1.9rem,4.8vw,3.4rem)] leading-[1.04] tracking-[-0.02em]`;
  const wrap = "mx-auto max-w-[1320px] px-6 py-20 md:px-12 md:py-28";

  return (
    <main className="relative min-h-screen" style={{ background: t.bg, color: t.ink }}>
      <header className="absolute left-0 top-0 z-40 w-full">
        <nav className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-6 md:px-12">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"><span className="h-3 w-3 rotate-45" style={{ background: t.accent }} />{spec.brand.name}</span>
          <div className="hidden items-center gap-9 font-mono text-[11px] uppercase tracking-[0.16em] md:flex" style={{ color: t.sub }}>{spec.nav.links.map((l) => <span key={l}>{l}</span>)}</div>
          <span className="px-5 py-2 text-sm font-medium" style={{ background: t.accent, color: t.on, borderRadius: t.btn }}>{spec.nav.cta}</span>
        </nav>
      </header>

      {spec.blocks.filter((b) => !b.hidden).map((b, i) => (
        <BlockView key={i} block={b} t={t} seed={seed + i} archetype={spec.archetype} scene={spec.scene} wrap={wrap} h2={h2} Kicker={Kicker} />
      ))}

      <footer className="px-6 pb-12 pt-20 md:px-12" style={{ borderTop: `1px solid ${t.line}` }}>
        <div className="mx-auto max-w-[1320px]">
          <Head text={`Let's make something unforgettable.`} t={t} className={`max-w-3xl ${t.head} text-[clamp(1.8rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.02em]`} />
          <div className="mt-12 flex flex-wrap items-end justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: t.sub }}>
            <div className="flex flex-wrap gap-x-9 gap-y-3">{spec.nav.links.map((l) => <span key={l}>{l}</span>)}</div>
            <div className="flex items-center gap-5">
              <span>© {spec.brand.name}</span>
              {watermark && <Link href="/create" data-cursor="hover" className="rounded-full px-3 py-1.5" style={{ border: `1px solid ${t.line}` }}>✦ Built with Voxel</Link>}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function BlockView({ block: b, t, seed, archetype, scene, wrap, h2, Kicker }: {
  block: Block; t: T; seed: number; archetype: string; scene: SiteSpec["scene"]; wrap: string; h2: string;
  Kicker: (p: { children: React.ReactNode }) => React.ReactElement;
}) {
  const card = { background: t.card, border: `1px solid ${t.line}`, borderRadius: t.rad } as const;

  switch (b.type) {
    case "hero": {
      const display = `${t.head} text-[clamp(2.7rem,8vw,7.5rem)] leading-[0.93] tracking-[-0.02em]`;
      const Eyebrow = () => <p className="font-mono text-[11px] uppercase tracking-[0.32em]" style={{ color: t.accent }}>{b.eyebrow}</p>;

      if (b.variant === "fullbleed") return (
        <section className="relative flex h-[92svh] min-h-[560px] items-end overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage(archetype, seed)})`, transform: "scale(1.05)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.15) 45%,rgba(0,0,0,0.78))" }} />
          <div className="relative mx-auto w-full max-w-[1320px] px-6 pb-16 md:px-12 md:pb-24 text-white">
            <Eyebrow /><HeroHeadline text={b.headline} t={t} className={`mt-4 ${display} !text-white`} /><p className="mt-6 max-w-xl text-lg text-white/80">{b.sub}</p>
            <div className="mt-8"><span className="px-7 py-3.5 text-sm font-medium" style={{ background: t.accent, color: t.on, borderRadius: t.btn }}>{b.cta} →</span></div>
          </div>
        </section>
      );
      if (b.variant === "centered") return (
        <section className="mx-auto max-w-4xl px-6 pb-12 pt-36 text-center md:pt-48">
          <Eyebrow /><HeroHeadline text={b.headline} t={t} className={`mt-5 ${display}`} /><p className="mx-auto mt-7 max-w-xl text-lg md:text-xl" style={{ color: t.sub }}>{b.sub}</p>
          <div className="mt-9 flex justify-center"><span className="px-8 py-4 text-sm font-medium" style={{ background: t.accent, color: t.on, borderRadius: t.btn }}>{b.cta} →</span></div>
          {b.media === "image" && <div className="mt-14 aspect-[16/8] w-full overflow-hidden bg-cover bg-center" style={{ borderRadius: t.rad, border: `1px solid ${t.line}`, backgroundImage: `url(${heroImage(archetype, seed)})` }} />}
        </section>
      );
      if (b.variant === "editorial") return (
        <section className="mx-auto max-w-[1320px] px-6 pb-16 pt-36 md:px-12 md:pt-48">
          <Eyebrow /><HeroHeadline text={b.headline} t={t} className={`mt-5 ${t.head} text-[clamp(3rem,12vw,11rem)] leading-[0.86] tracking-[-0.03em]`} />
          <div className="mt-10 grid gap-8 border-t pt-8 md:grid-cols-[1.5fr_1fr]" style={{ borderColor: t.line }}>
            <p className="max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: t.sub }}>{b.sub}</p>
            <div className="flex items-start md:justify-end"><span className="px-7 py-3.5 text-sm font-medium" style={{ background: t.accent, color: t.on, borderRadius: t.btn }}>{b.cta} →</span></div>
          </div>
        </section>
      );
      // split
      return (
        <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-6 pb-16 pt-36 md:grid-cols-[1.25fr_1fr] md:px-12 md:pt-44">
          <div><Eyebrow /><HeroHeadline text={b.headline} t={t} className={`mt-5 ${display}`} /><p className="mt-7 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: t.sub }}>{b.sub}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4"><span className="px-7 py-3.5 text-sm font-medium" style={{ background: t.accent, color: t.on, borderRadius: t.btn }}>{b.cta} →</span><span className="text-sm font-medium" style={{ color: t.sub }}>scroll to explore ↓</span></div>
          </div>
          {b.media === "3d"
            ? <div className="relative aspect-square overflow-hidden" style={{ borderRadius: t.rad, border: `1px solid ${t.line}` }}><SceneCanvas config={scene} autoplay interactive={false} className="!absolute inset-0" /><span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">real-time · webgl</span></div>
            : <div className="relative aspect-[4/5] overflow-hidden bg-cover bg-center" style={{ borderRadius: t.rad, border: `1px solid ${t.line}`, backgroundImage: `url(${heroImage(archetype, seed)})` }}><div className="absolute inset-0 mix-blend-overlay" style={{ background: `linear-gradient(140deg,${t.accent}44,transparent 60%)` }} /></div>}
        </section>
      );
    }

    case "marquee":
      return (
        <div className="overflow-hidden py-7" style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...b.items, ...b.items].map((x, i) => <span key={i} className={`flex items-center gap-10 ${t.head} text-3xl md:text-4xl`} style={{ color: i % 3 === 1 ? t.accent : t.ink }}>{x}<span style={{ color: t.accent }}>✦</span></span>)}
          </div>
        </div>
      );

    case "logos":
      return (
        <div className="px-6 py-12 md:px-12" style={{ borderBottom: `1px solid ${t.line}` }}>
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-12 gap-y-4" style={{ opacity: 0.55 }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: t.sub }}>{b.label}</span>
            {b.items.map((l) => <span key={l} className="font-mono text-sm uppercase tracking-[0.14em]" style={{ color: t.sub }}>{l}</span>)}
          </div>
        </div>
      );

    case "statement":
      return <section className="px-6 py-24 md:px-12 md:py-36"><Up><Head text={b.text} t={t} className={`mx-auto max-w-5xl ${t.head} text-[clamp(1.8rem,4.6vw,3.4rem)] leading-[1.12] tracking-[-0.01em]`} /></Up></section>;

    case "features": {
      const imgs = featureImages(seed, b.items.length);
      if (b.variant === "rows") return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className="mt-14 flex flex-col gap-px" style={{ background: t.line }}>
            {b.items.map((f, i) => (
              <Up key={i}><div className="grid items-center gap-8 py-9 md:grid-cols-[auto_1.1fr_1.3fr]" style={{ background: t.bg }}>
                <div className="font-mono text-sm" style={{ color: t.accent }}>{String(i + 1).padStart(2, "0")}</div>
                <div><h3 className={`${t.head} text-2xl md:text-3xl`}>{f.title}</h3><p className="mt-3 max-w-md leading-relaxed" style={{ color: t.sub }}>{f.body}</p></div>
                <div className="relative aspect-[16/10] overflow-hidden" style={{ borderRadius: t.rad, border: `1px solid ${t.line}` }}><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgs[i]})` }} /><div className="absolute inset-0 mix-blend-overlay" style={{ background: `linear-gradient(130deg,${t.accent}55,transparent 65%)` }} /></div>
              </div></Up>
            ))}
          </div>
        </section>
      );
      const bento = b.variant === "bento";
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className={`mt-14 grid gap-5 ${bento ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            {b.items.map((f, i) => (
              <Up key={i} delay={(i % 3) * 0.05} className={bento && i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                <div className="h-full overflow-hidden" style={card}>
                  <div className={`relative ${bento && i === 0 ? "h-56" : "h-32"} overflow-hidden`} style={{ borderBottom: `1px solid ${t.line}` }}><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgs[i]})` }} /><div className="absolute inset-0 mix-blend-overlay" style={{ background: `linear-gradient(140deg,${i % 2 ? t.accent : "#fff"}40,transparent 60%)` }} /></div>
                  <div className="p-6"><h3 className={`${t.head} text-xl`}>{f.title}</h3><p className="mt-2 text-sm leading-relaxed" style={{ color: t.sub }}>{f.body}</p></div>
                </div>
              </Up>
            ))}
          </div>
        </section>
      );
    }

    case "gallery": {
      const imgs = showcaseImages(archetype, seed, b.items.length);
      const masonry = b.variant === "masonry";
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className={`mt-14 grid gap-5 ${masonry ? "md:grid-cols-6" : "md:grid-cols-3"}`}>
            {b.items.map((c, i) => (
              <Up key={i} delay={(i % 3) * 0.05} className={masonry ? (i % 3 === 0 ? "md:col-span-4" : "md:col-span-2") : ""}>
                <div className="group overflow-hidden" style={{ borderRadius: t.rad, border: `1px solid ${t.line}` }}>
                  <div className={`relative overflow-hidden ${masonry && i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}><div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.1s] group-hover:scale-105" style={{ backgroundImage: `url(${imgs[i % imgs.length]})` }} /><div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 45%,rgba(0,0,0,0.65))" }} /><div className="absolute bottom-5 left-5"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">{c.tag}</span><h3 className={`${t.head} text-2xl text-white`}>{c.title}</h3></div></div>
                </div>
              </Up>
            ))}
          </div>
        </section>
      );
    }

    case "menu":
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className="mt-12 grid gap-x-16 gap-y-1 md:grid-cols-2">
            {b.items.map((m, i) => (
              <Up key={i} delay={(i % 2) * 0.05}><div className="flex items-baseline gap-4 py-5" style={{ borderBottom: `1px solid ${t.line}` }}>
                <div className="flex-1"><div className={`${t.head} text-xl`}>{m.name}</div><div className="mt-1 text-sm" style={{ color: t.sub }}>{m.desc}</div></div>
                <div className="font-mono text-lg" style={{ color: t.accent }}>{m.price}</div>
              </div></Up>
            ))}
          </div>
        </section>
      );

    case "steps":
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {b.items.map((s, i) => (
              <Up key={i} delay={i * 0.07}><div className={`${t.head} text-6xl`} style={{ color: t.accent }}>{String(i + 1).padStart(2, "0")}</div><h3 className={`mt-5 ${t.head} text-2xl`}>{s.title}</h3><p className="mt-3 leading-relaxed" style={{ color: t.sub }}>{s.body}</p></Up>
            ))}
          </div>
        </section>
      );

    case "stats":
      return (
        <section className={wrap} style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
          <Up><Kicker>{b.kicker}</Kicker></Up>
          <div className="mt-8 grid gap-12 md:grid-cols-3">
            {b.items.map((s, i) => (
              <Up key={i} delay={i * 0.08}><div className={`${t.head} text-[clamp(3.2rem,7vw,6rem)] leading-none tracking-[-0.03em]`} style={{ color: t.accent }}>{s.value}</div><div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.sub }}>{s.label}</div></Up>
            ))}
          </div>
        </section>
      );

    case "team":
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {b.items.map((m, i) => {
              const img = showcaseImages(archetype, seed + 9, 4)[i % 4];
              return <Up key={i} delay={(i % 4) * 0.05}><div className="overflow-hidden" style={{ borderRadius: t.rad, border: `1px solid ${t.line}` }}><div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} /><div className="p-4"><div className={`${t.head} text-lg`}>{m.name}</div><div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: t.sub }}>{m.role}</div></div></div></Up>;
            })}
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="px-6 py-24 text-center md:py-36">
          <div className="mx-auto max-w-4xl">
            {b.items.slice(0, 1).map((q, i) => (
              <Up key={i}><p className={`${t.head} text-[clamp(1.8rem,4.4vw,3.2rem)] leading-[1.12]`}><span style={{ color: t.accent }}>“</span>{q.quote}<span style={{ color: t.accent }}>”</span></p><p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.sub }}>{q.author} — {q.role}</p></Up>
            ))}
          </div>
        </section>
      );

    case "pricing":
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} /></Up>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {b.tiers.map((tier, i) => (
              <Up key={i} delay={i * 0.06}><div className="flex h-full flex-col p-8" style={{ borderRadius: t.rad, border: `1px solid ${tier.featured ? t.accent : t.line}`, background: tier.featured ? `${t.accent}10` : t.card }}>
                <div className="flex items-center justify-between"><span className={`${t.head} text-lg`}>{tier.name}</span>{tier.featured && <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: t.accent, color: t.on }}>Popular</span>}</div>
                <div className="mt-6 flex items-end gap-1"><span className={`${t.head} text-5xl`}>{tier.price}</span><span className="mb-1.5 text-sm" style={{ color: t.sub }}>{tier.period}</span></div>
                <ul className="mt-7 flex-1 space-y-3 text-sm" style={{ color: t.sub }}>{tier.features.map((f) => <li key={f} className="flex items-center gap-2.5"><span style={{ color: t.accent }}>✓</span>{f}</li>)}</ul>
                <span className="mt-8 px-6 py-3 text-center text-sm font-medium" style={{ background: tier.featured ? t.accent : "transparent", color: tier.featured ? t.on : t.ink, border: tier.featured ? "none" : `1px solid ${t.line}`, borderRadius: t.btn }}>{tier.cta}</span>
              </div></Up>
            ))}
          </div>
        </section>
      );

    case "faq":
      return (
        <section className={wrap}>
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
            <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={h2} /></Up>
            <div className="flex flex-col">
              {b.items.map((f, i) => (
                <Up key={i} delay={i * 0.05}><div className="py-6" style={{ borderTop: `1px solid ${t.line}` }}><div className={`${t.head} text-lg`}>{f.q}</div><p className="mt-2 leading-relaxed" style={{ color: t.sub }}>{f.a}</p></div></Up>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="px-6 py-12 md:px-12">
          <Up><div className="mx-auto flex max-w-[1320px] flex-col items-start gap-8 px-8 py-16 md:flex-row md:items-center md:justify-between md:px-16 md:py-24" style={{ background: t.inv, color: t.invInk, borderRadius: t.rad }}>
            <Head text={b.title} t={t} className={`max-w-2xl ${t.head} text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em]`} />
            <span className="shrink-0 px-8 py-4 text-base font-medium" style={{ background: t.accent, color: t.on, borderRadius: t.btn }}>{b.button} →</span>
          </div></Up>
        </section>
      );

    case "contact":
      return (
        <section className={wrap}>
          <Up><Kicker>{b.kicker}</Kicker><Head text={b.title} t={t} className={`max-w-3xl ${h2}`} />
            <a href={`mailto:${b.email}`} className={`mt-8 inline-block ${t.head} text-[clamp(1.6rem,5vw,3rem)] underline-offset-8 hover:underline`} style={{ color: t.accent }}>{b.email}</a>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: t.sub }}>{b.note}</p>
          </Up>
        </section>
      );

    default:
      return null;
  }
}
