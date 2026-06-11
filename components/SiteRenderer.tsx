"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { SceneCanvas } from "./SceneCanvas";
import type { SiteSpec, Section } from "@/lib/siteSpec";
import { featureImages, showcaseImages, heroImage } from "@/lib/siteImages";

const EASE = [0.16, 1, 0.3, 1] as const;
const NOANIM = false;

function seedOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ── theme tokens: light editorial or dark gallery, accent from the palette ─ */
type Tokens = {
  bg: string; ink: string; sub: string; line: string; card: string;
  inv: string; invInk: string; accent: string; on: string; light: boolean;
};
function lum(hex: string) {
  const h = hex.replace("#", "");
  return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
}
function tokens(spec: SiteSpec): Tokens {
  const accent = spec.scene.palette.a;
  const light = (spec.theme ?? (lum(spec.scene.palette.bg) > 0.5 ? "light" : "dark")) === "light";
  const on = lum(accent) > 0.6 ? "#0a0a0b" : "#ffffff"; // readable text on the accent
  return light
    ? { bg: "#f6f4ee", ink: "#0c0b0a", sub: "#56524b", line: "rgba(0,0,0,0.13)", card: "#ffffff", inv: "#0c0b0a", invInk: "#f6f4ee", accent, on, light: true }
    : { bg: spec.scene.palette.bg, ink: "#f4f1ea", sub: "rgba(244,241,234,0.62)", line: "rgba(255,255,255,0.12)", card: "rgba(255,255,255,0.035)", inv: "#f4f1ea", invInk: spec.scene.palette.bg, accent, on, light: false };
}

/* ── scroll reveal ──────────────────────────────────────────────────────── */
function Up({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  return (
    <motion.div ref={ref} className={className} initial={NOANIM ? false : { y: 34, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.9, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

/** split a headline so the final word carries the accent — an editorial flourish */
function AccentHeadline({ text, accent, className }: { text: string; accent: string; className?: string }) {
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return (
    <h1 className={className}>
      {words.join(" ")} {words.length ? " " : ""}
      <span className="italic" style={{ color: accent }}>{last}</span>
    </h1>
  );
}

export function SiteRenderer({ spec, watermark = true }: { spec: SiteSpec; watermark?: boolean }) {
  const t = tokens(spec);
  const seed = seedOf(spec.brand.name + spec.industry);
  const { scrollYProgress } = useScroll();

  const serif = "font-serif";
  const display = `text-[clamp(2.9rem,8.5vw,8.5rem)] leading-[0.92] tracking-[-0.02em] ${serif}`;

  return (
    <main className="relative min-h-screen" style={{ background: t.bg, color: t.ink }}>
      {/* nav */}
      <header className="absolute left-0 top-0 z-40 w-full">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-12">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
            <span className="h-3 w-3 rotate-45" style={{ background: t.accent }} />
            {spec.brand.name}
          </span>
          <div className="hidden items-center gap-9 font-mono text-[11px] uppercase tracking-[0.16em] md:flex" style={{ color: t.sub }}>
            {["Work", "Studio", "Approach", "Contact"].map((l) => <span key={l}>{l}</span>)}
          </div>
          <span className="rounded-full px-5 py-2 text-sm font-medium" style={{ background: t.accent, color: t.on }}>{spec.hero.cta}</span>
        </nav>
      </header>

      {/* ── hero ── */}
      <section className="relative mx-auto max-w-[1400px] px-6 pb-16 pt-32 md:px-12 md:pb-24 md:pt-44">
        <div className="grid items-end gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <motion.p initial={NOANIM ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="font-mono text-[11px] uppercase tracking-[0.32em]" style={{ color: t.accent }}>
              {spec.hero.eyebrow}
            </motion.p>
            <motion.div initial={NOANIM ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.08 }}>
              <AccentHeadline text={spec.hero.headline} accent={t.accent} className={`mt-5 ${display}`} />
            </motion.div>
            <motion.p initial={NOANIM ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="mt-7 max-w-md text-lg leading-relaxed md:text-xl" style={{ color: t.sub }}>
              {spec.hero.sub}
            </motion.p>
            <motion.div initial={NOANIM ? false : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }} className="mt-9 flex flex-wrap items-center gap-4">
              <span className="rounded-full px-7 py-3.5 text-sm font-medium" style={{ background: t.accent, color: t.on }}>{spec.hero.cta} →</span>
              <span className="text-sm font-medium" style={{ color: t.sub }}>or explore the work ↓</span>
            </motion.div>
          </div>

          {/* tasteful, contained live 3D — the signature */}
          <motion.div initial={NOANIM ? false : { scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 }} className="relative aspect-square overflow-hidden rounded-2xl" style={{ border: `1px solid ${t.line}` }}>
            <SceneCanvas config={spec.scene} autoplay interactive={false} className="!absolute inset-0" />
            <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">real-time · webgl</span>
          </motion.div>
        </div>
      </section>

      {/* sections */}
      {spec.sections.filter((s) => !s.hidden).map((s, i) => (
        <Block key={i} section={s} t={t} seed={seed} industry={spec.industry} />
      ))}

      {/* signature scroll moment */}
      <Signature spec={spec} t={t} seed={seed} progress={scrollYProgress} />

      {/* footer */}
      <footer className="px-6 pb-12 pt-20 md:px-12" style={{ borderTop: `1px solid ${t.line}` }}>
        <div className="mx-auto max-w-[1400px]">
          <div className={`max-w-3xl ${serif} text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em]`}>
            Let&apos;s make something <span className="italic" style={{ color: t.accent }}>unforgettable.</span>
          </div>
          <div className="mt-14 flex flex-wrap items-end justify-between gap-8 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: t.sub }}>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {["Work", "Studio", "Approach", "Journal", "Contact"].map((l) => <span key={l}>{l}</span>)}
            </div>
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

/* ── full-bleed signature scroll moment (image parallax + statement) ─────── */
function Signature({ spec, t, seed, progress }: { spec: SiteSpec; t: Tokens; seed: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const y = useTransform(progress, [0, 1], ["-8%", "8%"]);
  return (
    <section className="relative h-[90svh] overflow-hidden">
      <motion.div style={{ y, backgroundImage: `url(${heroImage(spec.industry, seed + 5)})` }} className="absolute inset-[-8%] bg-cover bg-center" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.7))" }} />
      <div className="absolute inset-0 mix-blend-overlay" style={{ background: `linear-gradient(130deg, ${t.accent}66, transparent 60%)` }} />
      <div className="absolute inset-0 flex items-center px-6 md:px-12">
        <div className="mx-auto w-full max-w-[1400px]">
          <Up>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">Built with Voxel</p>
            <p className={`mt-5 max-w-4xl font-serif text-[clamp(2.4rem,6.5vw,6rem)] leading-[0.98] tracking-[-0.02em] text-white`}>
              A website that <span className="italic" style={{ color: t.accent }}>moves</span> — generated from one sentence.
            </p>
          </Up>
        </div>
      </div>
    </section>
  );
}

/* ── section blocks (editorial styling) ─────────────────────────────────── */
function Block({ section: s, t, seed, industry }: { section: Section; t: Tokens; seed: number; industry: string }) {
  const wrap = "mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28";
  const Kicker = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: t.accent }}>{children}</p>
  );
  const h2 = `font-serif text-[clamp(2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.02em]`;

  if (s.type === "marquee") {
    return (
      <div className="overflow-hidden py-7" style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...s.items, ...s.items].map((x, i) => (
            <span key={i} className="flex items-center gap-10 font-serif text-3xl md:text-4xl" style={{ color: i % 3 === 1 ? t.accent : t.ink }}>
              {x}<span style={{ color: t.accent }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (s.type === "features") {
    const imgs = featureImages(seed, s.items.length);
    return (
      <section className={wrap}>
        <Up><Kicker>{s.kicker}</Kicker><h2 className={`max-w-3xl ${h2}`}>{s.title}</h2></Up>
        <div className="mt-16 flex flex-col gap-px" style={{ background: t.line }}>
          {s.items.map((f, i) => (
            <Up key={i} delay={(i % 2) * 0.05}>
              <div className="grid items-center gap-8 py-10 md:grid-cols-[auto_1.1fr_1.4fr]" style={{ background: t.bg }}>
                <div className="font-mono text-sm" style={{ color: t.accent }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl">{f.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed" style={{ color: t.sub }}>{f.body}</p>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl" style={{ border: `1px solid ${t.line}` }}>
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgs[i]})` }} />
                  <div className="absolute inset-0 mix-blend-overlay" style={{ background: `linear-gradient(130deg, ${t.accent}55, transparent 65%)` }} />
                </div>
              </div>
            </Up>
          ))}
        </div>
      </section>
    );
  }

  if (s.type === "stats") {
    return (
      <section className={wrap} style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <Up><Kicker>{s.kicker}</Kicker></Up>
        <div className="mt-8 grid gap-12 md:grid-cols-3">
          {s.items.map((st, i) => (
            <Up key={i} delay={i * 0.08}>
              <div className={`font-serif text-[clamp(3.5rem,8vw,6.5rem)] leading-none tracking-[-0.03em]`} style={{ color: t.accent }}>{st.value}</div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.sub }}>{st.label}</div>
            </Up>
          ))}
        </div>
      </section>
    );
  }

  if (s.type === "steps") {
    return (
      <section className={wrap}>
        <Up><Kicker>{s.kicker}</Kicker><h2 className={`max-w-3xl ${h2}`}>{s.title}</h2></Up>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {s.items.map((st, i) => (
            <Up key={i} delay={i * 0.07}>
              <div className="text-6xl font-serif" style={{ color: t.accent }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-5 font-serif text-2xl">{st.title}</h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: t.sub }}>{st.body}</p>
            </Up>
          ))}
        </div>
      </section>
    );
  }

  if (s.type === "showcase") {
    const imgs = showcaseImages(industry, seed, Math.max(3, s.items.length));
    return (
      <section className={wrap}>
        <Up><Kicker>{s.kicker}</Kicker><h2 className={`max-w-3xl ${h2}`}>{s.title}</h2></Up>
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {s.items.map((c, i) => (
            <Up key={i} delay={i * 0.06} className={i % 3 === 0 ? "md:col-span-4" : "md:col-span-2"}>
              <div className="group overflow-hidden rounded-2xl" style={{ border: `1px solid ${t.line}` }}>
                <div className={`relative overflow-hidden ${i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] group-hover:scale-105" style={{ backgroundImage: `url(${imgs[i]})` }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6))" }} />
                  <div className="absolute bottom-5 left-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">{c.tag}</span>
                    <h3 className="font-serif text-2xl text-white">{c.title}</h3>
                  </div>
                </div>
              </div>
            </Up>
          ))}
        </div>
      </section>
    );
  }

  if (s.type === "quote") {
    return (
      <section className="px-6 py-28 text-center md:py-40">
        <div className="mx-auto max-w-4xl">
          <Up>
            <p className={`font-serif text-[clamp(1.9rem,4.5vw,3.4rem)] leading-[1.12] tracking-[-0.01em]`}>
              <span style={{ color: t.accent }}>“</span>{s.quote}<span style={{ color: t.accent }}>”</span>
            </p>
            <p className="mt-9 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.sub }}>{s.author} — {s.role}</p>
          </Up>
        </div>
      </section>
    );
  }

  if (s.type === "cta") {
    return (
      <section className="px-6 py-12 md:px-12">
        <Up>
          <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-8 rounded-[2rem] px-8 py-16 md:flex-row md:items-center md:justify-between md:px-16 md:py-24" style={{ background: t.inv, color: t.invInk }}>
            <h2 className={`max-w-2xl font-serif text-[clamp(2.2rem,5vw,4.2rem)] leading-[1] tracking-[-0.02em]`}>{s.title}</h2>
            <span className="shrink-0 rounded-full px-8 py-4 text-base font-medium" style={{ background: t.accent, color: t.on }}>{s.button} →</span>
          </div>
        </Up>
      </section>
    );
  }

  return null;
}
