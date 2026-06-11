"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * The product flow: prompt → generation → live site, in 3 steps.
 * This is what Voxel actually is (real-time 3D sites from one sentence,
 * competing with Draftly) — surfaced inside the V3 design.
 *
 * Opens with a prompt already typed (from the bottom bar), plays a staged
 * 3-step generation, then lands on a "ready" state that hands off to the real
 * builder at /create.
 */
const STEPS = [
  { k: "Reading your prompt", d: "Parsing intent, tone & references" },
  { k: "Composing the 3D scene", d: "Lighting, camera, materials & motion" },
  { k: "Publishing your site", d: "Optimising and going live on the edge" },
];

export function CreateFlow({ prompt, onClose }: { prompt: string | null; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // 0..3 (3 === done)

  // animate in + run the staged generation whenever a new prompt arrives
  useEffect(() => {
    if (!prompt || !root.current) return;
    const el = root.current;
    setStep(0);

    gsap.set(el, { display: "flex" });
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(
      el.querySelectorAll("[data-rise]"),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.08, delay: 0.05 }
    );

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep(1), 1100));
    timers.push(setTimeout(() => setStep(2), 2300));
    timers.push(setTimeout(() => setStep(3), 3600));
    return () => timers.forEach(clearTimeout);
  }, [prompt]);

  const close = () => {
    const el = root.current;
    if (!el) return onClose();
    gsap.to(el, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(el, { display: "none" });
        onClose();
      },
    });
  };

  const done = step >= 3;

  return (
    <div
      ref={root}
      style={{ display: "none" }}
      className="fixed inset-0 z-[90] hidden items-center justify-center bg-ink/85 px-6 backdrop-blur-xl"
    >
      {/* close */}
      <button
        onClick={close}
        data-cursor="hover"
        className="absolute right-6 top-6 font-mono text-xs uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-cream md:right-10"
      >
        Close ✕
      </button>

      <div className="w-full max-w-2xl">
        <p data-rise className="font-mono text-[11px] uppercase tracking-[0.3em] text-acid/80">
          Voxel · Prompt → 3D site
        </p>

        {/* the prompt echoed back */}
        <h2 data-rise className="mt-5 font-serif text-3xl italic leading-tight text-cream md:text-5xl">
          “{prompt}”
        </h2>

        {/* steps */}
        <div data-rise className="mt-12 space-y-3">
          {STEPS.map((s, i) => {
            const state = step > i ? "done" : step === i ? "active" : "todo";
            return (
              <div
                key={s.k}
                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors duration-500 ${
                  state === "todo"
                    ? "border-ink-line bg-white/[0.02] text-cream/35"
                    : "border-acid/30 bg-acid/[0.06] text-cream"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    state === "done"
                      ? "border-acid bg-acid text-ink"
                      : state === "active"
                        ? "border-acid text-acid"
                        : "border-ink-line text-cream/40"
                  }`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium md:text-base">{s.k}</div>
                  <div className="text-xs text-cream/45">{s.d}</div>
                </div>
                {state === "active" && (
                  <span className="h-2 w-2 animate-ping rounded-full bg-acid" aria-hidden />
                )}
              </div>
            );
          })}
        </div>

        {/* ready state */}
        <div
          className={`mt-10 flex flex-col items-start gap-4 transition-all duration-500 sm:flex-row sm:items-center ${
            done ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cream/60">
            ● Your 3D site is live
          </span>
          <div className="flex items-center gap-3">
            <Link
              href={`/create?p=${encodeURIComponent(prompt ?? "")}`}
              data-cursor="hover"
              className="rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              Open in builder →
            </Link>
            <button
              onClick={close}
              data-cursor="hover"
              className="rounded-full border border-ink-line px-6 py-3 text-sm font-medium text-cream/80 transition-colors hover:text-cream"
            >
              New prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
