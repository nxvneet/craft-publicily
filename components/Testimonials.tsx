"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const QUOTES = [
  { q: "We shipped a launch page in an afternoon that looked like a month of agency work.", a: "Maya Chen", r: "VP Product, Northwind", i: "MC" },
  { q: "The first time scroll moved a real 3D camera, our founder said 'how is this not a video?'", a: "Dev Patel", r: "Head of Growth, Lumen", i: "DP" },
  { q: "It replaced our designer-dev handoff for marketing pages entirely. We just describe and publish.", a: "Lena Ortiz", r: "Founder, Atelier Nine", i: "LO" },
  { q: "Cinematic, fast, and the copy was actually good. I edited two words and hit publish.", a: "Tomás Rivera", r: "Indie maker", i: "TR" },
];

const LOGOS = ["NORTHWIND", "LUMEN", "ATELIER 9", "STACKFORGE", "ORBIT", "VELA"];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const cur = QUOTES[i];

  return (
    <section className="px-6 py-24 md:px-10 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-10 text-[11px] uppercase tracking-[0.3em] text-cream-dim">/ loved by builders</p>

        <div className="relative min-h-[220px] md:min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-2xl font-medium leading-snug tracking-tight md:text-4xl">
                <span className="text-acid">“</span>
                {cur.q}
                <span className="text-acid">”</span>
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-ink-line bg-ink-soft font-mono text-xs text-cream">
                  {cur.i}
                </span>
                <span className="text-sm text-cream-dim">
                  <span className="text-cream">{cur.a}</span> — {cur.r}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-1.5">
          {QUOTES.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              data-cursor="hover"
              className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-acid" : "w-1.5 bg-cream/25"}`}
              aria-label={`Quote ${n + 1}`}
            />
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
          {LOGOS.map((l) => (
            <span key={l} className="font-mono text-xs uppercase tracking-[0.2em] text-cream-dim">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
