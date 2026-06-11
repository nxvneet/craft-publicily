"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { imageFor, type Project } from "@/lib/gallery";

/**
 * Basic project "page" that animates in over the gallery when a card is tapped.
 * GSAP drives a clip-path/translate reveal from the bottom plus a content
 * stagger; closing reverses it. Intentionally a light template — the gallery
 * is the focus.
 */
export function ProjectPage({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!project || !root.current) return;
    const el = root.current;
    const items = el.querySelectorAll<HTMLElement>("[data-stagger]");

    tl.current?.kill();
    gsap.set(el, { display: "block" });
    tl.current = gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.9 })
      .fromTo(
        items,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 },
        "-=0.5"
      );

    return () => {
      tl.current?.kill();
    };
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

  return (
    <div
      ref={root}
      style={{ display: "none" }}
      className="fixed inset-0 z-[80] hidden overflow-y-auto bg-ink text-cream"
    >
      {project && (
        <div className="min-h-full">
          {/* top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-md bg-ink/60">
            <button
              onClick={close}
              data-cursor="hover"
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-cream/70 transition-colors hover:text-acid"
            >
              ← Back to work
            </button>
            <span data-stagger className="font-mono text-xs uppercase tracking-[0.2em] text-cream/40">
              {project.client} · {project.year}
            </span>
          </div>

          {/* hero */}
          <div className="px-6 md:px-12">
            <p data-stagger className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-acid/80">
              {project.tags.join(" · ")}
            </p>
            <h1
              data-stagger
              className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-8xl"
            >
              {project.title}
            </h1>

            <div
              data-stagger
              className="mt-12 aspect-[16/8] w-full overflow-hidden rounded-2xl bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${project.palette[0]}33, ${project.palette[1]}66), url(${imageFor(project)})`,
              }}
            />

            {/* meta + copy */}
            <div className="grid gap-12 py-16 md:grid-cols-[1fr_2fr]">
              <div data-stagger className="space-y-6">
                {[
                  ["Client", project.client],
                  ["Year", project.year],
                  ["Disciplines", project.tags.join(", ")],
                ].map(([k, v]) => (
                  <div key={k} className="border-t border-ink-line pt-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40">{k}</div>
                    <div className="mt-1 text-cream/90">{v}</div>
                  </div>
                ))}
              </div>
              <div data-stagger className="space-y-6 text-lg leading-relaxed text-cream/70 md:text-xl">
                <p>
                  A technology-led creative project crafted for global reach. We blended real-time 3D,
                  motion and editorial systems into a single living experience.
                </p>
                <p>
                  This page is a lightweight template — the focus of V3 is the spherical gallery you came
                  from. Hit “Back to work” to keep exploring the sphere.
                </p>
              </div>
            </div>

            {/* secondary gradient blocks */}
            <div data-stagger className="grid grid-cols-1 gap-6 pb-24 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-2xl"
                  style={{
                    background: `linear-gradient(${i ? 220 : 320}deg, ${project.palette[i ? 1 : 0]}, ${project.palette[i ? 0 : 1]})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
