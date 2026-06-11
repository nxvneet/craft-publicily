"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import gsap from "gsap";
import {
  imageFor,
  galleryImages,
  projectStats,
  nextProject,
  type Project,
  type SiteLayout,
} from "@/lib/gallery";

/* ── per-archetype theme so each project reads as its own website ───────── */
type Theme = {
  bg: string;
  text: string;
  dim: string;
  line: string;
  card: string;
  font: string; // tailwind family class for display type
  dark: boolean;
};

const THEMES: Record<SiteLayout, Theme> = {
  editorial: { bg: "#f4f1ea", text: "#0c0b0a", dim: "#6f6b63", line: "rgba(0,0,0,0.12)", card: "#ffffff", font: "font-serif", dark: false },
  product: { bg: "#ffffff", text: "#0a0a0b", dim: "#6b6b70", line: "rgba(0,0,0,0.10)", card: "#f5f5f7", font: "font-display", dark: false },
  campaign: { bg: "#0b0b10", text: "#f4f1ea", dim: "#8c8c95", line: "rgba(255,255,255,0.12)", card: "#15151b", font: "font-display", dark: true },
  motion: { bg: "#050507", text: "#f4f1ea", dim: "#76767e", line: "rgba(255,255,255,0.10)", card: "#0d0d13", font: "font-mono", dark: true },
};

const lum = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
/** accent that contrasts with the theme background */
function pickAccent([a, b]: [string, string], dark: boolean) {
  const la = lum(a),
    lb = lum(b);
  return dark ? (la >= lb ? a : b) : la <= lb ? a : b;
}

const NOANIM = false;

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={NOANIM ? false : { y: 30, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function ProjectSite({ project, onClose, onOpen }: { project: Project | null; onClose: () => void; onOpen: (p: Project) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project || !root.current) return;
    const el = root.current;
    gsap.set(el, { display: "block" });
    gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: "expo.out" });
    scroller.current?.scrollTo({ top: 0 });
  }, [project]);

  const close = () => {
    const el = root.current;
    if (!el) return onClose();
    gsap.to(el, {
      yPercent: 100,
      duration: 0.6,
      ease: "expo.in",
      onComplete: () => {
        gsap.set(el, { display: "none" });
        onClose();
      },
    });
  };

  const t = project ? THEMES[project.layout] : THEMES.campaign;
  const accent = project ? pickAccent(project.palette, t.dark) : "#d8ff3e";

  return (
    <div ref={root} style={{ display: "none" }} className="fixed inset-0 z-[85] hidden">
      {project && (
        <div ref={scroller} key={project.slug} className="h-full overflow-y-auto" style={{ background: t.bg, color: t.text }}>
          {/* sticky bar */}
          <div
            className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 md:px-10"
            style={{ background: `${t.bg}d9`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${t.line}` }}
          >
            <button onClick={close} data-cursor="hover" className="flex items-center gap-2 text-sm font-medium" style={{ color: t.dim }}>
              ← All work
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: t.dim }}>
              {project.client} · {project.year}
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.dim }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} /> Live
            </span>
          </div>

          <Hero project={project} theme={t} accent={accent} />

          {/* overview + meta */}
          <section className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
            <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                  Overview
                </p>
                <p className={`mt-6 text-2xl leading-[1.35] md:text-[2.1rem] ${t.font}`}>{project.overview}</p>
                <p className="mt-6 max-w-xl text-base leading-relaxed" style={{ color: t.dim }}>
                  We partnered end-to-end — from strategy and art direction to a real-time build — shipping a single,
                  living experience that put {project.client} in front of the world.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <dl className="space-y-5">
                  {[
                    ["Client", project.client],
                    ["Year", project.year],
                    ["Disciplines", project.tags.join(", ")],
                    ["Studio", "Voxel"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ borderTop: `1px solid ${t.line}` }} className="pt-3">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: t.dim }}>
                        {k}
                      </dt>
                      <dd className="mt-1">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </section>

          <Gallery project={project} theme={t} />

          {/* stats */}
          <section className="px-6 py-20 md:py-28" style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
            <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
              {projectStats(project).map((s, i) => (
                <Reveal key={s.label} delay={i * 0.08}>
                  <div className={`text-6xl md:text-7xl ${t.font}`} style={{ color: accent }}>
                    {s.value}
                  </div>
                  <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.dim }}>
                    {s.label}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* quote */}
          <section className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
            <Reveal>
              <p className={`text-3xl leading-tight md:text-5xl ${t.font}`}>
                <span style={{ color: accent }}>“</span>
                Voxel turned our brief into something people actually wanted to share.
                <span style={{ color: accent }}>”</span>
              </p>
              <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: t.dim }}>
                {project.client} — Brand Lead
              </p>
            </Reveal>
          </section>

          <NextProject current={project} theme={t} accent={accent} onOpen={onOpen} />

          {/* footer */}
          <footer className="px-6 py-10 md:px-10" style={{ borderTop: `1px solid ${t.line}` }}>
            <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: t.dim }}>
              <span>{project.client} × Voxel</span>
              <button onClick={close} data-cursor="hover">
                Back to the sphere ↺
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

/* ── hero variants ──────────────────────────────────────────────────────── */
function Hero({ project, theme: t, accent }: { project: Project; theme: Theme; accent: string }) {
  const img = imageFor(project);
  const layout = project.layout;

  if (layout === "campaign") {
    // full-bleed image with the title overlaid
    return (
      <section className="relative h-[82svh] min-h-[520px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})`, transform: "scale(1.04)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75))" }} />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
          <motion.div initial={NOANIM ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/80">{project.tags.join(" · ")}</p>
            <h1 className={`mt-4 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-8xl ${t.font}`}>
              {project.title}
            </h1>
          </motion.div>
        </div>
      </section>
    );
  }

  if (layout === "motion") {
    // black, kinetic — repeating marquee of the title + framed image
    return (
      <section className="overflow-hidden pt-16 md:pt-24">
        <div className="overflow-hidden py-4" style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`text-4xl uppercase tracking-tight md:text-6xl ${t.font}`} style={{ color: i % 2 ? accent : t.text }}>
                {project.title} ✦
              </span>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
          <motion.div
            initial={NOANIM ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
            <div className="absolute inset-0 mix-blend-overlay" style={{ background: `linear-gradient(120deg, ${accent}55, transparent)` }} />
          </motion.div>
        </div>
      </section>
    );
  }

  // editorial + product: title block, then a large image
  const centered = layout === "product";
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 md:px-10 md:pt-28">
      <motion.div
        initial={NOANIM ? false : { y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className={centered ? "text-center" : ""}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
          {project.tags.join(" · ")}
        </p>
        <h1 className={`mt-5 text-5xl leading-[0.98] tracking-tight md:text-8xl ${t.font} ${centered ? "mx-auto max-w-4xl font-semibold" : "max-w-4xl"}`}>
          {project.title}
        </h1>
      </motion.div>
      <motion.div
        initial={NOANIM ? false : { y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
        className="mt-12 aspect-[16/8] w-full overflow-hidden rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${img})`, border: `1px solid ${t.line}` }}
      />
    </section>
  );
}

/* ── gallery (varies per archetype) ─────────────────────────────────────── */
function Gallery({ project, theme: t }: { project: Project; theme: Theme }) {
  const imgs = galleryImages(project, 4);
  const tile = (src: string, className: string, i: number) => (
    <Reveal key={i} delay={(i % 2) * 0.08} className={className}>
      <div className="h-full w-full overflow-hidden rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${src})`, border: `1px solid ${t.line}`, minHeight: 220 }} />
    </Reveal>
  );

  return (
    <section className="mx-auto max-w-6xl px-6 pb-4 md:px-10">
      {project.layout === "editorial" ? (
        <div className="grid gap-5 md:grid-cols-3">
          {tile(imgs[1], "md:col-span-2 md:row-span-2", 0)}
          {tile(imgs[2], "", 1)}
          {tile(imgs[3], "", 2)}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {tile(imgs[1], "", 0)}
          {tile(imgs[2], "", 1)}
        </div>
      )}
    </section>
  );
}

/* ── next project ───────────────────────────────────────────────────────── */
function NextProject({ current, theme: t, accent, onOpen }: { current: Project; theme: Theme; accent: string; onOpen: (p: Project) => void }) {
  const next = nextProject(current);
  return (
    <button onClick={() => onOpen(next)} data-cursor="hover" className="group relative block h-[44svh] min-h-[320px] w-full overflow-hidden text-left">
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${imageFor(next)})` }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.7))" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
          Next project
        </span>
        <span className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{next.title}</span>
        <span className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-white/70">{next.client} · {next.year} →</span>
      </div>
    </button>
  );
}
