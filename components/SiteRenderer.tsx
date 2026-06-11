"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { CinematicCanvas } from "./CinematicCanvas";
import type { SiteSpec, Section, TypeStyle } from "@/lib/siteSpec";

const EASE = [0.16, 1, 0.3, 1] as const;

function titleClass(ts: TypeStyle) {
  switch (ts) {
    case "editorial": return "font-serif italic text-4xl md:text-6xl tracking-[-0.02em]";
    case "mono": return "font-mono uppercase text-3xl md:text-5xl tracking-tight";
    case "display": return "font-medium text-5xl md:text-7xl tracking-[-0.04em] leading-[0.95]";
    default: return "font-medium text-4xl md:text-6xl tracking-[-0.03em] leading-[1]";
  }
}

function Up({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  return (
    <motion.div ref={ref} className={className} initial={{ y: 28, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.8, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

// Faux product dashboard — the single biggest "this is a real product" signal.
function ProductMockup({ a, b }: { a: string; b: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b11] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
        <div className="ml-3 h-5 flex-1 rounded bg-white/5" />
      </div>
      <div className="flex h-[280px]">
        <div className="hidden w-1/4 space-y-2.5 border-r border-white/10 p-3.5 sm:block">
          <div className="mb-4 h-3 w-2/3 rounded" style={{ background: a }} />
          {[...Array(6)].map((_, i) => <div key={i} className="h-2.5 rounded bg-white/8" style={{ width: `${90 - i * 8}%` }} />)}
        </div>
        <div className="flex-1 p-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[a, b, "#ffffff20"].map((c, i) => (
              <div key={i} className="rounded-lg border border-white/8 p-3">
                <div className="h-2 w-1/2 rounded bg-white/15" />
                <div className="mt-2 h-4 w-3/4 rounded" style={{ background: c }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-32 items-end gap-1.5 rounded-lg border border-white/8 p-3">
            {[40, 65, 50, 80, 60, 95, 72, 88, 55, 78].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i % 2 ? a : `${a}66` }} />
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-2.5 rounded bg-white/8" style={{ width: `${85 - i * 20}%` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteRenderer({ spec, watermark = true }: { spec: SiteSpec; watermark?: boolean }) {
  const { a, b, bg } = spec.scene.palette;
  const ts = spec.typeStyle;
  const navLinks = spec.sections.filter((s) => s.type === "features" || s.type === "stats" || s.type === "steps").map((s) => ("title" in s ? s.title : "")).filter(Boolean).slice(0, 3);

  return (
    <main className="relative" style={{ background: bg }}>
      {/* sticky nav — makes it read as a real site */}
      <header className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl" style={{ background: `${bg}cc` }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <span className="flex items-center gap-2 text-lg font-semibold text-cream">
            <span className="h-5 w-5 rounded" style={{ background: a }} />
            {spec.brand.name}
          </span>
          <div className="hidden items-center gap-7 text-sm text-cream/60 md:flex">
            {["Features", "Pricing", "Customers", "Docs"].map((l) => <span key={l} className="transition-colors hover:text-cream">{l}</span>)}
          </div>
          <span className="rounded-full px-4 py-2 text-sm font-semibold text-ink" style={{ background: a }}>{spec.hero.cta}</span>
        </nav>
      </header>

      {/* hero — copy + product mockup on a palette gradient */}
      <section className="relative overflow-hidden px-6 py-20 md:px-10 md:py-28" style={{ background: `radial-gradient(120% 80% at 80% -10%, ${a}1f, transparent 55%), radial-gradient(100% 80% at 0% 110%, ${b}22, transparent 55%)` }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Up>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-cream/70">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: a }} /> {spec.hero.eyebrow}
            </span>
            <h1 className={`mt-5 text-cream ${ts === "display" ? "text-5xl md:text-7xl" : "text-5xl md:text-6xl"} font-medium tracking-[-0.03em] leading-[0.98]`}>
              {spec.hero.headline}
            </h1>
            <p className="mt-5 max-w-md text-lg text-cream/65">{spec.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full px-6 py-3 text-sm font-semibold text-ink" style={{ background: a }}>{spec.hero.cta} →</span>
              <span className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-cream">Book a demo</span>
            </div>
          </Up>
          <Up delay={0.12}><ProductMockup a={a} b={b} /></Up>
        </div>
      </section>

      {/* logos */}
      <div className="border-y border-white/8 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
          <span className="text-xs uppercase tracking-widest text-cream/70">Trusted by teams at</span>
          {["Northwind", "Lumen", "Vela", "Orbit", "Atlas"].map((l) => <span key={l} className="font-mono text-sm uppercase tracking-[0.15em] text-cream/70">{l}</span>)}
        </div>
      </div>

      {/* generated content sections */}
      {spec.sections.filter((s) => !s.hidden).map((s, i) => <SectionBlock key={i} section={s} a={a} b={b} bg={bg} ts={ts} navLinks={navLinks} />)}

      {/* signature: the cinematic 3D scroll showcase */}
      <section className="relative h-[80svh] overflow-hidden">
        <CinematicCanvas image={spec.image} interactive amp={0.7} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-transparent to-black/30 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: a }}>Built with Voxel</p>
            <h2 className="mt-3 text-4xl font-medium tracking-tight text-cream md:text-6xl">A site that moves.</h2>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/8 px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-2 text-xl font-semibold text-cream"><span className="h-5 w-5 rounded" style={{ background: a }} />{spec.brand.name}</span>
            <p className="mt-3 max-w-xs text-sm text-cream/50">{spec.brand.tagline}</p>
          </div>
          {[["Product", ["Features", "Pricing", "Changelog", "Docs"]], ["Company", ["About", "Careers", "Blog", "Contact"]], ["Legal", ["Privacy", "Terms", "Security"]]].map(([h, items]) => (
            <div key={h as string}>
              <div className="text-sm font-medium text-cream">{h as string}</div>
              <div className="mt-3 space-y-2 text-sm text-cream/50">{(items as string[]).map((x) => <div key={x}>{x}</div>)}</div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-white/8 pt-6 text-xs text-cream/40">
          <span>© {spec.brand.name}</span>
          {watermark && <Link href="/create" data-cursor="hover" className="rounded-full border border-white/10 px-3 py-1.5 text-cream/70">✦ Built with Voxel</Link>}
        </div>
      </footer>
    </main>
  );
}

function SectionBlock({ section: s, a, b, bg, ts }: { section: Section; a: string; b: string; bg: string; ts: TypeStyle; navLinks: string[] }) {
  const Kicker = ({ children }: { children: React.ReactNode }) => <p className="mb-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: a }}>{children}</p>;
  const wrap = "px-6 py-20 md:px-10 md:py-24";
  const inner = "mx-auto max-w-6xl";

  if (s.type === "marquee") {
    return (
      <div className="overflow-hidden border-y border-white/8 py-6">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
          {[...s.items, ...s.items].map((t, i) => <span key={i} className="flex items-center gap-8 text-2xl font-medium tracking-tight text-cream/70 md:text-3xl">{t}<span style={{ color: a }}>✦</span></span>)}
        </div>
      </div>
    );
  }
  if (s.type === "features") {
    return (
      <section className={wrap}>
        <div className={inner}>
          <Up><Kicker>{s.kicker}</Kicker><h2 className={`max-w-3xl text-cream ${titleClass(ts)}`}>{s.title}</h2></Up>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            {s.items.map((f, i) => (
              <Up key={i} delay={(i % 2) * 0.06} className="rounded-2xl border border-white/8 p-7" >
                <div className="mb-5 h-32 rounded-xl border border-white/8" style={{ background: `radial-gradient(120% 100% at 20% 0%, ${i % 2 ? b : a}33, transparent 60%), #ffffff06` }} />
                <h3 className="text-xl font-medium text-cream">{f.title}</h3>
                <p className="mt-2 text-cream/60">{f.body}</p>
              </Up>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (s.type === "stats") {
    return (
      <section className={`${wrap} border-y border-white/8`} style={{ background: `${a}08` }}>
        <div className={inner}>
          <Up><Kicker>{s.kicker}</Kicker></Up>
          <div className="grid gap-10 md:grid-cols-3">
            {s.items.map((st, i) => (
              <Up key={i} delay={i * 0.08}>
                <div className="text-6xl font-medium tracking-tight text-cream md:text-7xl" style={{ color: a }}>{st.value}</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-cream/50">{st.label}</div>
              </Up>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (s.type === "steps") {
    return (
      <section className={wrap}>
        <div className={inner}>
          <Up><Kicker>{s.kicker}</Kicker><h2 className={`max-w-3xl text-cream ${titleClass(ts)}`}>{s.title}</h2></Up>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {s.items.map((st, i) => (
              <Up key={i} delay={i * 0.07} className="rounded-2xl border border-white/8 p-7">
                <span className="grid h-10 w-10 place-items-center rounded-full font-mono text-sm text-ink" style={{ background: a }}>{i + 1}</span>
                <h3 className="mt-5 text-xl font-medium text-cream">{st.title}</h3>
                <p className="mt-2 text-cream/60">{st.body}</p>
              </Up>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (s.type === "showcase") {
    return (
      <section className={wrap}>
        <div className={inner}>
          <Up><Kicker>{s.kicker}</Kicker><h2 className={`max-w-3xl text-cream ${titleClass(ts)}`}>{s.title}</h2></Up>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {s.items.map((c, i) => (
              <Up key={i} delay={i * 0.07} className="overflow-hidden rounded-2xl border border-white/8">
                <div className="aspect-[4/3]" style={{ background: `radial-gradient(120% 100% at 30% 10%, ${a}40, transparent 60%), ${bg}` }} />
                <div className="p-5"><span className="font-mono text-xs uppercase tracking-widest" style={{ color: a }}>{c.tag}</span><h3 className="mt-1 text-xl font-medium text-cream">{c.title}</h3></div>
              </Up>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (s.type === "quote") {
    return (
      <section className={`${wrap} text-center`}>
        <div className="mx-auto max-w-4xl">
          <Up>
            <p className="text-3xl font-medium leading-tight tracking-tight text-cream md:text-5xl"><span style={{ color: a }}>“</span>{s.quote}<span style={{ color: a }}>”</span></p>
            <p className="mt-7 text-sm uppercase tracking-wider text-cream/50">{s.author} — {s.role}</p>
          </Up>
        </div>
      </section>
    );
  }
  if (s.type === "cta") {
    return (
      <section className="px-6 py-24 md:py-32" style={{ background: `radial-gradient(120% 100% at 50% 0%, ${a}1f, transparent 60%)` }}>
        <Up className="mx-auto max-w-3xl text-center">
          <h2 className={`text-cream ${titleClass(ts)}`}>{s.title}</h2>
          <span className="mt-8 inline-block rounded-full px-8 py-4 text-base font-semibold text-ink" style={{ background: a }}>{s.button} →</span>
        </Up>
      </section>
    );
  }
  return null;
}
