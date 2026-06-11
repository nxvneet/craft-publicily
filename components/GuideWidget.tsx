"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

const TIPS = [
  { q: "How do I start?", a: "Type one sentence in the hero and hit Generate — you'll land in the live builder.", href: "/create" },
  { q: "Can I edit the copy?", a: "Yes — in the builder, click any text in the preview to rewrite it.", href: "/create" },
  { q: "How do I publish?", a: "Hit Publish in the builder for an instant shareable link.", href: "/create" },
  { q: "Is there a minimal theme?", a: "Switch to Editorial (V2) from the nav for the light, minimal look.", href: "/v2" },
];

export function GuideWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[300px] overflow-hidden rounded-2xl border border-ink-line bg-ink/85 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 border-b border-ink-line px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-acid" />
              <span className="text-sm font-medium">Guide</span>
              <span className="ml-auto text-[11px] text-cream-dim">usually instant</span>
            </div>
            <div className="max-h-[320px] space-y-2 overflow-y-auto p-3">
              {TIPS.map((t) => (
                <Link
                  key={t.q}
                  href={t.href}
                  data-cursor="hover"
                  className="block rounded-xl border border-ink-line p-3 transition-colors hover:border-cream/30"
                >
                  <div className="text-sm font-medium text-cream">{t.q}</div>
                  <div className="mt-1 text-xs text-cream-dim">{t.a}</div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="hover"
        className="flex items-center gap-2 rounded-full border border-ink-line bg-ink/70 px-4 py-2.5 text-sm font-medium text-cream shadow-lg backdrop-blur-xl transition-transform hover:scale-[1.03]"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-acid text-[11px] text-ink">{open ? "×" : "?"}</span>
        Guide
      </button>
    </div>
  );
}
