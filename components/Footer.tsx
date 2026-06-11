"use client";

import Link from "next/link";
import { Magnetic, RevealWords } from "./primitives";
import { TimeStrip } from "./TimeStrip";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink-line px-6 pb-10 pt-28 md:px-10 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[14vw] font-medium leading-[0.82] tracking-[-0.04em] md:text-[11vw]">
          <RevealWords text="Build the" />
          <br />
          <span className="font-serif italic clip-text">
            <RevealWords text="unscrollable." delay={0.15} />
          </span>
        </h2>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Magnetic>
            <Link
              href="/create"
              data-cursor="hover"
              className="noise-btn hairline rounded-full bg-acid px-8 py-4 text-base font-semibold text-ink"
            >
              Start with one prompt →
            </Link>
          </Magnetic>
          <span className="text-cream-dim">No card. Live in 10 seconds.</span>
        </div>

        <div className="mt-28 grid gap-8 border-t border-ink-line pt-10 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-2.5">
            <span className="block h-4 w-4 rotate-45 border-2 border-cream" />
            <span className="text-lg font-semibold tracking-tight">VOXEL</span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-cream-dim">
            {["Showcase", "Templates", "Pricing", "Docs", "Changelog", "X / Twitter"].map((l) => (
              <Link key={l} href="#" className="transition-colors hover:text-cream" data-cursor="hover">
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-cream-dim/60">
            © {new Date().getFullYear()} Voxel. A real-time alternative to frame-based 3D builders.
          </p>
          <TimeStrip className="text-cream-dim/60" />
        </div>
      </div>
    </footer>
  );
}
