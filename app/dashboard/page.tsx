"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { listMySites, type SiteRecord } from "@/lib/sites";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function Dashboard() {
  const [sites, setSites] = useState<SiteRecord[] | null>(null);
  const live = isSupabaseConfigured();

  useEffect(() => {
    listMySites().then(setSites);
  }, []);

  return (
    <main className="min-h-[100svh] px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" data-cursor="hover" className="flex items-center gap-2.5">
            <span className="block h-4 w-4 rotate-45 border-2 border-cream" />
            <span className="text-sm font-semibold tracking-tight">VOXEL</span>
          </Link>
          <Link
            href="/create"
            data-cursor="hover"
            className="noise-btn hairline rounded-full bg-acid px-5 py-2 text-sm font-semibold text-ink"
          >
            New site +
          </Link>
        </div>

        <div className="mt-16 flex items-end justify-between">
          <h1 className="text-5xl font-medium tracking-[-0.03em] md:text-7xl">Your sites</h1>
          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              live ? "border-acid/40 text-acid" : "border-ink-line text-cream-dim"
            }`}
          >
            {live ? "● live database" : "● local mode"}
          </span>
        </div>

        {sites === null ? (
          <div className="mt-20 grid place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-line border-t-acid" />
          </div>
        ) : sites.length === 0 ? (
          <div className="mt-20 rounded-2xl border border-dashed border-ink-line p-16 text-center">
            <p className="text-2xl font-medium">Nothing published yet</p>
            <p className="mt-2 text-cream-dim">Your published 3D sites will show up here.</p>
            <Link
              href="/create"
              data-cursor="hover"
              className="mt-6 inline-block rounded-full bg-acid px-6 py-3 text-sm font-semibold text-ink"
            >
              Build your first →
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {sites.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.06 }}
                className="overflow-hidden rounded-2xl border border-ink-line bg-ink-soft"
              >
                <div
                  className="aspect-video"
                  style={{
                    background: `radial-gradient(120% 90% at 30% 20%, ${s.spec.scene.palette.a}55, transparent 60%), radial-gradient(120% 90% at 80% 90%, ${s.spec.scene.palette.b}66, transparent 55%), ${s.spec.scene.palette.bg}`,
                  }}
                />
                <div className="p-5">
                  <h3 className="text-xl font-medium">{s.name}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-cream-dim">{s.prompt || "—"}</p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/s/${s.id}${s.url.includes("?d=") ? `?d=${s.url.split("?d=")[1]}` : ""}`}
                      target="_blank"
                      data-cursor="hover"
                      className="flex-1 rounded-lg bg-acid py-2 text-center text-sm font-semibold text-ink"
                    >
                      Open ↗
                    </Link>
                    <button
                      onClick={() => navigator.clipboard?.writeText(s.url)}
                      data-cursor="hover"
                      className="hairline rounded-lg px-3 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
