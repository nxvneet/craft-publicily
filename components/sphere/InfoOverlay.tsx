"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export type PanelKind = "about" | "pricing" | null;

/**
 * Slide-up overlay for the bottom-nav items. "About" tells the actual product
 * story (build a 3D website in 3 steps, vs Draftly). "Pricing" replaces the
 * old "Careers" tab with something tied to the real V1 product.
 */
export function InfoOverlay({ kind, onClose }: { kind: PanelKind; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!kind || !root.current) return;
    const el = root.current;
    tl.current?.kill();
    gsap.set(el, { display: "block" });
    tl.current = gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.85 })
      .fromTo(
        el.querySelectorAll("[data-rise]"),
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 },
        "-=0.45"
      );
    return () => {
      tl.current?.kill();
    };
  }, [kind]);

  const close = () => {
    const el = root.current;
    if (!el) return onClose();
    gsap.to(el, {
      yPercent: 100,
      duration: 0.55,
      ease: "expo.in",
      onComplete: () => {
        gsap.set(el, { display: "none" });
        onClose();
      },
    });
  };

  return (
    <div
      ref={root}
      style={{ display: "none" }}
      className="fixed inset-0 z-[85] hidden overflow-y-auto bg-ink text-cream"
    >
      {/* header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-ink/60 px-6 py-5 backdrop-blur-md md:px-12">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream/50">
          {kind === "about" ? "About — Voxel" : "Pricing — Voxel"}
        </span>
        <button
          onClick={close}
          data-cursor="hover"
          className="font-mono text-xs uppercase tracking-[0.2em] text-cream/70 transition-colors hover:text-acid"
        >
          Close ✕
        </button>
      </div>

      {kind === "about" && <About />}
      {kind === "pricing" && <Pricing />}
    </div>
  );
}

function About() {
  return (
    <div className="px-6 pb-28 md:px-12">
      <p data-rise className="mt-12 font-mono text-xs uppercase tracking-[0.3em] text-acid/80">
        One prompt → a living 3D website
      </p>
      <h1
        data-rise
        className="mt-5 max-w-5xl font-display text-4xl font-semibold leading-[0.98] tracking-tight md:text-7xl"
      >
        We turn a single sentence into a real-time, scroll-driven 3D site — then publish it in one click.
      </h1>
      <p data-rise className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/70 md:text-xl">
        Voxel is a 3D website builder for people who don&apos;t want to touch WebGL. No frames, no shader
        math, no boilerplate. Describe what you want, watch it compose a cinematic scene in real time,
        and ship it. Where Draftly stops at flat pages, Voxel is spatial and alive from the first prompt.
      </p>

      {/* the 3 steps */}
      <div data-rise className="mt-16 grid gap-5 md:grid-cols-3">
        {[
          { n: "01", t: "Prompt", d: "Write one sentence describing your site — tone, content and vibe." },
          { n: "02", t: "Generate", d: "Voxel builds a real-time 3D scene with lighting, motion and copy." },
          { n: "03", t: "Publish", d: "Tweak inline, then go live on the edge in a single click." },
        ].map((s) => (
          <div key={s.n} className="rounded-2xl border border-ink-line bg-white/[0.02] p-7">
            <div className="font-mono text-sm text-acid">{s.n}</div>
            <div className="mt-4 text-2xl font-semibold">{s.t}</div>
            <p className="mt-2 text-cream/55">{s.d}</p>
          </div>
        ))}
      </div>

      {/* stats */}
      <div data-rise className="mt-14 grid grid-cols-2 gap-8 border-t border-ink-line pt-10 md:grid-cols-4">
        {[
          ["3", "steps to live"],
          ["< 60s", "prompt to preview"],
          ["1-click", "publishing"],
          ["100%", "real-time WebGL"],
        ].map(([k, v]) => (
          <div key={v}>
            <div className="font-display text-4xl font-semibold md:text-5xl">{k}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-cream/45">{v}</div>
          </div>
        ))}
      </div>

      <div data-rise className="mt-14">
        <Link
          href="/create"
          data-cursor="hover"
          className="inline-block rounded-full bg-acid px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
        >
          Build your 3D site →
        </Link>
      </div>
    </div>
  );
}

function Pricing() {
  const tiers = [
    { name: "Starter", price: "$0", note: "For your first scene", features: ["1 published site", "Voxel subdomain", "Real-time editor", "Community presets"], cta: "Start free", accent: false },
    { name: "Pro", price: "$24", note: "per month", features: ["Unlimited sites", "Custom domain", "Remove Voxel badge", "Priority generation", "Export to HTML"], cta: "Go Pro", accent: true },
    { name: "Studio", price: "Custom", note: "For teams & agencies", features: ["Everything in Pro", "Team workspaces", "Brand kits & components", "SSO + support SLA"], cta: "Talk to us", accent: false },
  ];
  return (
    <div className="px-6 pb-28 md:px-12">
      <h1 data-rise className="mt-12 font-display text-4xl font-semibold tracking-tight md:text-6xl">
        Pricing
      </h1>
      <p data-rise className="mt-4 max-w-xl text-lg text-cream/60">
        Start free. Upgrade when your 3D sites go live to the world.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            data-rise
            className={`flex flex-col rounded-3xl border p-8 ${
              t.accent ? "border-acid/40 bg-acid/[0.06]" : "border-ink-line bg-white/[0.02]"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">{t.name}</span>
              {t.accent && (
                <span className="rounded-full bg-acid px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
                  Popular
                </span>
              )}
            </div>
            <div className="mt-6 font-display text-5xl font-semibold">{t.price}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-cream/45">{t.note}</div>
            <ul className="mt-7 space-y-3 text-sm text-cream/70">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="text-acid">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              data-cursor="hover"
              className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${
                t.accent ? "bg-acid text-ink" : "border border-ink-line text-cream"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
