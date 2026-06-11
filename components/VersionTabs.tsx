"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const TABS = [
  { href: "/", label: "Cinematic", n: "01" },
  { href: "/v2", label: "Editorial", n: "02" },
  { href: "/v3", label: "Spherical", n: "03" },
];

/** Tab navbar to switch between the Cinematic (V1) and Editorial (V2) sites. */
export function VersionTabs({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const pathname = usePathname();
  const dark = theme === "dark";

  return (
    <div className="inline-block">
      <div
        className={`flex items-center gap-1 rounded-full border p-1 ${
          dark ? "border-ink-line bg-ink/40" : "border-black/10 bg-white/50"
        }`}
      >
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              data-cursor="hover"
              className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? dark ? "text-ink" : "text-white"
                  : dark ? "text-cream/70 hover:text-cream" : "text-black/60 hover:text-black"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="versionPill"
                  className={`absolute inset-0 -z-10 rounded-full ${dark ? "bg-acid" : "bg-[#0b0b10]"}`}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <span className="font-mono opacity-50">{t.n}</span>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
