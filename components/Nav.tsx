"use client";

import Link from "next/link";
import { VersionTabs } from "./VersionTabs";

const LINKS = ["Showcase", "Templates", "Pricing", "Docs"];

export function Nav() {
  return (
    <header className="fixed left-0 top-3 z-50 w-full px-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-ink/50 py-2 pl-5 pr-2 backdrop-blur-2xl">
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5" data-cursor="hover">
            <span className="block h-4 w-4 rotate-45 border-2 border-cream" />
            <span className="text-base font-semibold tracking-tight text-cream">VOXEL</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-cream/70 md:flex">
            {LINKS.map((l) => (
              <Link key={l} href={`#${l.toLowerCase()}`} className="transition-colors hover:text-cream" data-cursor="hover">
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <VersionTabs theme="dark" />
          </div>
          <Link
            href="/create"
            data-cursor="hover"
            className="rounded-full bg-acid px-5 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            Get started →
          </Link>
        </div>
      </nav>
    </header>
  );
}
