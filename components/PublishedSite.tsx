"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { SceneCanvas } from "./SceneCanvas";
import type { SceneConfig } from "@/lib/scenes";

export function PublishedSite({
  config,
  watermark = true,
}: {
  config: SceneConfig;
  watermark?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => (progressRef.current = v));
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <main ref={ref} className="relative" style={{ background: config.palette.bg }}>
      <div className="fixed inset-0 z-0">
        <SceneCanvas config={config} progressRef={progressRef} interactive={false} />
      </div>

      {watermark && (
        <Link
          href="/create"
          data-cursor="hover"
          className="fixed bottom-4 right-4 z-30 rounded-full border border-ink-line bg-ink/50 px-3 py-1.5 text-[11px] text-cream backdrop-blur-md"
        >
          ✦ Built with Voxel
        </Link>
      )}

      <section className="relative z-10 grid min-h-[100svh] place-items-center px-6 text-center">
        <motion.div style={{ opacity: heroOpacity }}>
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: config.palette.a }}>
            {config.geometry} · {config.motion}
          </p>
          <h1 className="text-[14vw] font-medium leading-[0.85] tracking-[-0.04em] text-cream md:text-[9vw]">
            {config.name}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-cream/70 md:text-lg">{config.tagline}</p>
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-cream/60">
          scroll
        </div>
      </section>

      <Block align="left" accent={config.palette.a} kicker="01 / what">
        A real-time 3D experience that responds to every scroll. No video, no
        stitched frames — a living scene rendered in your browser.
      </Block>
      <Block align="right" accent={config.palette.a} kicker="02 / why">
        Crisp on every device, editable at any moment, and yours to keep. This
        entire site was generated from a single sentence.
      </Block>

      <section className="relative z-10 grid min-h-[100svh] place-items-center px-6 text-center">
        <div>
          <h2 className="text-5xl font-medium tracking-tight text-cream md:text-8xl">
            Want one<span className="font-serif italic"> like this?</span>
          </h2>
          <Link
            href="/create"
            data-cursor="hover"
            className="mt-8 inline-block rounded-full px-8 py-4 text-base font-semibold text-ink"
            style={{ background: config.palette.a }}
          >
            Build yours free →
          </Link>
        </div>
      </section>
    </main>
  );
}

function Block({
  children,
  align,
  accent,
  kicker,
}: {
  children: React.ReactNode;
  align: "left" | "right";
  accent: string;
  kicker: string;
}) {
  return (
    <section className="relative z-10 grid min-h-[100svh] items-center px-6 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-xl ${align === "right" ? "ml-auto text-right" : ""}`}
      >
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: accent }}>
          {kicker}
        </p>
        <p className="text-3xl font-medium leading-snug tracking-tight text-cream md:text-5xl">
          {children}
        </p>
      </motion.div>
    </section>
  );
}
