"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SphereGallery } from "@/components/sphere/SphereGallery";
import { ProjectSite } from "@/components/sphere/ProjectSite";
import { CreateFlow } from "@/components/sphere/CreateFlow";
import { InfoOverlay, type PanelKind } from "@/components/sphere/InfoOverlay";
import { Intro } from "@/components/sphere/Intro";
import { VersionTabs } from "@/components/VersionTabs";
import type { Project } from "@/lib/gallery";

const EXAMPLES = [
  "a neon synthwave portfolio for a 3D artist",
  "a calm studio site for a ceramics brand",
  "a bold landing page for a space startup",
];

const SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;
const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } } };

const MotionLink = motion.create(Link);

export default function SphericalPage() {
  const [active, setActive] = useState<Project | null>(null);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [sound, setSound] = useState(false);
  const [text, setText] = useState("");
  const [genPrompt, setGenPrompt] = useState<string | null>(null);
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setIntro(false), 1600);
    return () => clearTimeout(id);
  }, []);

  const submit = () => {
    const p = text.trim();
    if (p) setGenPrompt(p);
  };

  const NAV = [
    { label: "Work", on: () => setPanel(null), active: panel === null },
    { label: "About", on: () => setPanel("about"), active: panel === "about" },
    { label: "Pricing", on: () => setPanel("pricing"), active: panel === "pricing" },
  ] as const;

  return (
    <main className="fixed inset-0 overflow-hidden bg-ink text-cream select-none">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,42,0.6),_#050509_70%)]" />

      {/* the gallery (handles its own swipe/drag) */}
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        <SphereGallery onOpen={setActive} />
      </div>

      {/* ── HUD: staggered reveal once the intro lifts ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30"
        variants={container}
        initial="hidden"
        animate={intro ? "hidden" : "show"}
      >
        {/* top-left: logo + sound */}
        <motion.div variants={rise} className="absolute left-6 top-5 flex items-center gap-6 md:left-8">
          <MotionLink href="/" data-cursor="hover" className="pointer-events-auto flex items-center gap-2.5" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}>
            <span className="block h-5 w-5 rotate-45 border-2 border-cream" />
            <span className="text-lg font-semibold tracking-tight">VOXEL</span>
          </MotionLink>
          <button onClick={() => setSound((s) => !s)} data-cursor="hover" className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-cream">
            Sound [{sound ? "ON" : "OFF"}]
          </button>
        </motion.div>

        {/* top-center: tagline */}
        <motion.p variants={rise} className="absolute left-1/2 top-5 hidden max-w-md -translate-x-1/2 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-cream/70 lg:block">
          Voxel is a real-time 3D website builder. One prompt becomes a living, scroll-driven site.
        </motion.p>

        {/* top-right: locations + Let's Talk */}
        <motion.div variants={rise} className="absolute right-6 top-5 flex items-center gap-6 md:right-8">
          <div className="hidden flex-col items-end font-mono text-[10px] uppercase tracking-[0.15em] text-cream/55 md:flex">
            <span>● London, UK — Real-time</span>
            <span className="text-cream/35">○ Auckland, NZ — Render farm</span>
          </div>
          <MotionLink href="/create" data-cursor="hover" className="pointer-events-auto rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}>
            Let&apos;s Talk
          </MotionLink>
        </motion.div>

        {/* bottom-left: version tabs */}
        <motion.div variants={rise} className="pointer-events-auto absolute bottom-6 left-6 md:left-8">
          <VersionTabs theme="dark" />
        </motion.div>

        {/* ── bottom-center: the prompt window ── */}
        <motion.div variants={rise} className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
          {/* example chips */}
          <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <motion.button key={ex} onClick={() => setText(ex)} data-cursor="hover" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                className="rounded-full border border-ink-line bg-ink/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cream/55 backdrop-blur-md transition-colors hover:border-acid/40 hover:text-cream">
                {ex}
              </motion.button>
            ))}
          </div>

          {/* prompt bar */}
          <div className="pointer-events-auto flex w-[min(92vw,560px)] items-center gap-2 rounded-full border border-ink-line bg-ink/55 py-2 pl-5 pr-2 backdrop-blur-md transition-colors focus-within:border-acid/50">
            <motion.span className="text-acid" animate={{ rotate: [0, 90, 0], scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>✦</motion.span>
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Describe your 3D website…" data-cursor="hover"
              className="min-w-0 flex-1 bg-transparent text-sm text-cream placeholder:text-cream/40 focus:outline-none" />
            <motion.button onClick={submit} data-cursor="hover" aria-label="Generate" disabled={!text.trim()}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-acid text-ink disabled:opacity-40">
              <motion.span className="inline-block" initial={false} whileHover={{ x: 2 }}>→</motion.span>
            </motion.button>
          </div>

          {/* nav pill with a sliding indicator (shared layout) */}
          <nav className="pointer-events-auto flex items-center rounded-full border border-ink-line bg-ink/50 p-1.5 backdrop-blur-md">
            {NAV.map((t) => (
              <button key={t.label} onClick={t.on} data-cursor="hover"
                className={`relative rounded-full px-6 py-2 text-sm font-medium transition-colors ${t.active ? "text-ink" : "text-cream/70 hover:text-cream"}`}>
                {t.active && <motion.span layoutId="v3navpill" className="absolute inset-0 -z-10 rounded-full bg-cream" transition={SPRING} />}
                {t.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* bottom-right: filter */}
        <motion.button variants={rise} data-cursor="hover" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
          className="pointer-events-auto absolute bottom-6 right-6 rounded-full border border-ink-line bg-ink/50 px-6 py-3 text-sm font-medium text-cream/80 backdrop-blur-md transition-colors hover:text-cream md:right-8">
          Filter
        </motion.button>
      </motion.div>

      <AnimatePresence>{intro && <Intro key="intro" />}</AnimatePresence>

      <ProjectSite project={active} onClose={() => setActive(null)} onOpen={setActive} />
      <InfoOverlay kind={panel} onClose={() => setPanel(null)} />
      <CreateFlow prompt={genPrompt} onClose={() => setGenPrompt(null)} />
    </main>
  );
}
