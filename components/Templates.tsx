"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PRESETS, type SceneConfig } from "@/lib/scenes";
import { RevealWords } from "./primitives";

export function Templates() {
  return (
    <section id="templates" className="px-6 py-28 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cream-dim">/ showcase</p>
            <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">
              <RevealWords text="Start from a preset" />
            </h2>
          </div>
          <p className="max-w-xs text-cream-dim">
            Six worlds, fully editable. One click drops you into the builder with it
            loaded as a live, real-time scene.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {PRESETS.map((p, i) => (
            <TemplateCard key={p.id} preset={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({ preset: p, index }: { preset: SceneConfig; index: number }) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push(`/create?p=${encodeURIComponent(p.prompt)}`)}
      data-cursor="hover"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-ink-line text-left"
    >
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 80% at 30% 20%, ${p.palette.a}40, transparent 60%), ${p.palette.bg}` }}
        />
      )}

      {/* CSS sheen sweep on hover (no WebGL) */}
      <div className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: p.palette.a }}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        <span className="self-start rounded-full border border-white/15 bg-ink/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cream/80 backdrop-blur-sm">
          {p.category}
        </span>
        <div>
          <h3 className="text-3xl font-medium tracking-tight text-cream">{p.name}</h3>
          <p className="mt-1 text-sm text-cream/70">{p.tagline}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-acid px-4 py-1.5 text-sm font-semibold text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
            Use this →
          </span>
        </div>
      </div>
    </motion.button>
  );
}
