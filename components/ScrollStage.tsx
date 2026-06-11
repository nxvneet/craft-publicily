"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";

const CAPTIONS = [
  { at: 0.1, title: "It reacts to you", body: "Scroll position drives the frame — a cinematic scene you steer, not watch." },
  { at: 0.42, title: "Pure video, buttery smooth", body: "No 400-image download, no jank. It plays exactly as fast as you scroll." },
  { at: 0.74, title: "Yours to edit", body: "Swap the scene, the copy, the palette — then publish in one click." },
];

export function ScrollStage() {
  const ref = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const target = useRef(0); // desired video time (0..duration), set by scroll

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const el = video.current;
    if (el?.duration) target.current = Math.min(el.duration - 0.05, Math.max(0, v * el.duration));
  });

  // Ease the video timeline toward the scroll target — one seek per frame, smooth.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.pause();
    let raf = 0;
    const tick = () => {
      if (el.readyState >= 2 && el.duration) {
        const diff = target.current - el.currentTime;
        // ease toward the scroll target; tiny per-frame deltas seek smoothly
        if (Math.abs(diff) > 0.01) el.currentTime += diff * 0.2;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={ref} className="relative h-[260vh]" id="showcase">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
        <video
          ref={video}
          muted
          playsInline
          preload="auto"
          poster="/cine/bloom.png"
          className="h-full w-full scale-105 object-cover"
        >
          <source src="/cine/hero.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />

        <div className="absolute right-6 top-1/2 z-10 hidden h-40 w-px -translate-y-1/2 bg-ink-line md:block">
          <motion.div className="absolute left-0 top-0 w-px bg-acid" style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }} />
        </div>

        {CAPTIONS.map((c, i) => (
          <Caption key={i} caption={c} progress={scrollYProgress} />
        ))}

        <div className="absolute left-6 top-24 z-10 text-[11px] uppercase tracking-[0.3em] text-cream-dim md:left-10">/ the scroll engine</div>
      </div>
    </section>
  );
}

function Caption({ caption, progress }: { caption: (typeof CAPTIONS)[number]; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const w = 0.16;
  const lo = Math.max(0, caption.at - w);
  const hi = Math.min(1, caption.at + w);
  const opacity = useTransform(progress, [lo, caption.at, hi], [0, 1, 0]);
  const y = useTransform(progress, [lo, caption.at, hi], [40, 0, -40]);
  return (
    <motion.div style={{ opacity, y }} className="absolute bottom-24 left-6 z-10 max-w-md md:left-10">
      <h3 className="text-4xl font-medium tracking-tight [text-shadow:0_2px_30px_rgba(0,0,0,0.6)] md:text-6xl">{caption.title}</h3>
      <p className="mt-3 text-cream/85 [text-shadow:0_1px_20px_rgba(0,0,0,0.6)] md:text-lg">{caption.body}</p>
    </motion.div>
  );
}
