"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

const SUGGESTIONS = [
  "a liquid chrome fintech landing",
  "a neon AI agent for developers",
  "a molten energy drink launch",
  "a quiet brutalist architecture studio",
];

export function Hero() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = (prompt: string) => {
    const p = prompt.trim();
    if (!p) return;
    router.push(`/create?p=${encodeURIComponent(p)}`);
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 md:px-10">
      {/* pre-rendered VIDEO backdrop — no real-time WebGL (smooth like Draftly) */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/cine/bloom.png"
          className="h-full w-full scale-105 object-cover"
        >
          <source src="/cine/hero.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-ink" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/25" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Watch demo */}
        <motion.button
          onClick={() => scrollTo("showcase")}
          data-cursor="hover"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-ink-line bg-ink/40 py-1.5 pl-1.5 pr-4 text-sm text-cream backdrop-blur-md"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-acid text-ink">▶</span>
          Watch it react to scroll
        </motion.button>

        <h1 className="max-w-6xl text-[11.5vw] font-medium leading-[0.9] tracking-[-0.04em] text-cream [text-shadow:0_2px_50px_rgba(0,0,0,0.55)] md:text-[6.6vw]">
          <span className="block overflow-hidden pb-[0.16em]">
            <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}>
              One prompt.
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.16em]">
            <motion.span className="block font-serif italic text-acid" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}>
              A living 3D website.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-6 max-w-xl text-base text-cream/85 [text-shadow:0_1px_24px_rgba(0,0,0,0.6)] md:text-lg"
        >
          Describe it. Watch it render in real time. Publish in one click. No frames
          to stitch, no timeline to scrub, no code to touch.
        </motion.p>

        {/* one-prompt box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="mt-8 max-w-2xl"
        >
          <div className="group flex items-center gap-2 rounded-2xl border border-ink-line bg-ink/60 p-2 backdrop-blur-xl transition-colors focus-within:border-acid/60" data-cursor="hover">
            <span className="pl-3 text-cream-dim">✦</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go(value)}
              placeholder="Describe the site you want…"
              className="flex-1 bg-transparent py-3 text-base text-cream outline-none placeholder:text-cream-dim/60"
            />
            <button onClick={() => go(value)} className="rounded-xl bg-acid px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]" data-cursor="hover">
              Generate →
            </button>
          </div>

          {/* dual entry modes */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/create" data-cursor="hover" className="flex items-center gap-2 rounded-full border border-ink-line bg-ink/50 px-5 py-2.5 text-sm font-medium text-cream backdrop-blur-md transition-colors hover:border-cream/40">
              ⬢ 3D Website Builder →
            </Link>
            <button onClick={() => scrollTo("templates")} data-cursor="hover" className="flex items-center gap-2 rounded-full border border-ink-line bg-ink/50 px-5 py-2.5 text-sm font-medium text-cream backdrop-blur-md transition-colors hover:border-cream/40">
              ◳ Build from a preset
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => go(s)} data-cursor="hover" className="rounded-full border border-ink-line bg-ink/30 px-3 py-1.5 text-xs text-cream-dim backdrop-blur-sm transition-colors hover:border-cream/40 hover:text-cream">
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* edge-pinned editorial chrome */}
      <div className="absolute bottom-6 left-6 z-10 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55 md:left-10 md:flex">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-acid" />
        </span>
        rendering · real-time webgl
      </div>
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-cream-dim">scroll to feel it</div>
      <div className="absolute bottom-6 right-6 z-10 hidden text-right font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55 md:right-10 md:block">
        no frames · no code
        <br />
        <span className="text-cream/35">est. 2026 — voxel</span>
      </div>
    </section>
  );
}
