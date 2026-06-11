"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { VersionTabs } from "@/components/VersionTabs";
import { TimeStrip } from "@/components/TimeStrip";
import { EditorialCanvas } from "@/components/editorial/EditorialCanvas";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function EditorialPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const go = () => {
    const p = value.trim();
    if (p) router.push(`/create?p=${encodeURIComponent(p)}`);
  };

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[#f4f1ea] text-ink">
      <VersionTabs theme="light" />

      {/* top bar */}
      <header className="absolute left-0 top-0 z-40 flex w-full items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-6">
          <Link href="/" data-cursor="hover" className="flex items-center gap-2.5">
            <span className="block h-4 w-4 rotate-45 border-2 border-ink" />
            <span className="text-lg font-semibold tracking-tight text-ink">VOXEL</span>
          </Link>
          <TimeStrip className="hidden text-ink/55 lg:flex" />
        </div>
        <Link
          href="/create"
          data-cursor="hover"
          className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Start building →
        </Link>
      </header>

      {/* minimal cursor-reactive graphic (right) */}
      <div className="absolute inset-y-0 right-0 z-0 w-full md:w-[56%]">
        <EditorialCanvas className="!absolute inset-0" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#f4f1ea] via-[#f4f1ea]/40 to-transparent md:via-transparent" />

      {/* editorial content (left) */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center px-6 md:px-10">
        <div className="pointer-events-auto w-full max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mb-7 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/45"
          >
            Voxel — Vol. 02 · Editorial
          </motion.p>

          <h1 className="text-[12vw] font-light leading-[0.92] tracking-[-0.03em] text-ink md:text-[5.6vw]">
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
                One prompt.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.14em]">
              <motion.span className="block font-serif italic" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.32 }}>
                A living website.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-7 max-w-md text-base text-ink/60 md:text-lg"
          >
            The same engine, stripped to its essence. Describe it once — Voxel renders
            a real-time, scroll-driven site and publishes it in a single click.
          </motion.p>

          {/* editorial prompt — a single underlined line */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.85 }}
            className="mt-10 max-w-lg"
          >
            <div className="flex items-center gap-4 border-b border-ink/25 pb-3 transition-colors focus-within:border-ink" data-cursor="hover">
              <span className="text-ink/35">✦</span>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Describe the site you want…"
                className="min-w-0 flex-1 bg-transparent py-1 text-lg text-ink outline-none placeholder:text-ink/35"
              />
              <button onClick={go} data-cursor="hover" className="text-2xl text-ink transition-transform hover:translate-x-1">
                →
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">Press enter to generate</p>
          </motion.div>
        </div>
      </div>

      {/* corner chrome */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45 md:left-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-40" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
        </span>
        rendering · real-time webgl
      </div>
      <div className="absolute bottom-6 right-6 z-20 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45 md:right-10">
        restraint over noise
        <br />
        <span className="text-ink/30">est. 2026 — voxel</span>
      </div>
    </main>
  );
}
