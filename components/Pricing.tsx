"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Reveal, Magnetic } from "./primitives";
import { PLANS, PLAN_ORDER, type PlanKey } from "@/lib/billing";
import { startCheckout } from "@/lib/checkout";

export function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [demo, setDemo] = useState<{ plan: string; price: number } | null>(null);

  const choose = async (key: PlanKey) => {
    if (key === "free") {
      router.push("/create");
      return;
    }
    setLoading(key);
    const r = await startCheckout(key);
    if (r.status === "demo") setDemo({ plan: r.plan, price: r.price });
    else if (r.status === "error") setDemo({ plan: key, price: PLANS[key].price });
    setLoading(null);
  };

  return (
    <section id="pricing" className="px-6 py-28 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-4xl font-medium tracking-[-0.03em] md:text-7xl">
            Priced to <span className="font-serif italic clip-text">undercut</span>
          </h2>
          <p className="max-w-xs text-cream-dim">
            Half the price of the incumbent, twice the ease. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {PLAN_ORDER.map((key, i) => {
            const t = PLANS[key];
            const highlight = key === "studio";
            return (
              <Reveal
                key={key}
                delay={i * 0.06}
                className={`flex flex-col rounded-2xl border p-6 ${
                  highlight ? "border-acid bg-acid/5" : "border-ink-line bg-ink-soft"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{t.name}</span>
                  {highlight && (
                    <span className="rounded-full bg-acid px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-medium tracking-tight">${t.price}</span>
                  <span className="text-sm text-cream-dim">{t.price === 0 ? "forever" : "/mo"}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-cream-dim">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-acid">→</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Magnetic strength={0.2}>
                  <button
                    onClick={() => choose(key)}
                    disabled={loading === key}
                    data-cursor="hover"
                    className={`noise-btn mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors disabled:opacity-60 ${
                      highlight ? "bg-acid text-ink" : "hairline text-cream hover:text-ink"
                    }`}
                  >
                    {loading === key ? "Starting…" : key === "free" ? "Start free" : `Get ${t.name}`}
                  </button>
                </Magnetic>
              </Reveal>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {demo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDemo(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-ink-line bg-ink-soft p-7 text-center"
            >
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-acid/40 text-2xl text-acid">
                ✦
              </div>
              <h3 className="text-2xl font-medium">Checkout is in demo mode</h3>
              <p className="mt-2 text-sm text-cream-dim">
                Billing for <span className="text-cream">{demo.plan}</span> (${demo.price}/mo) is fully
                wired — add your Stripe keys + price IDs to <code className="text-cream">.env.local</code> and
                this button takes you straight to a live Stripe Checkout.
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  href="/create"
                  data-cursor="hover"
                  className="flex-1 rounded-lg bg-acid py-2.5 text-sm font-semibold text-ink"
                >
                  Keep building free
                </Link>
                <button
                  onClick={() => setDemo(null)}
                  data-cursor="hover"
                  className="hairline flex-1 rounded-lg py-2.5 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
