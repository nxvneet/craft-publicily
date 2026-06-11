"use client";

import { useEffect, useState } from "react";

const ZONES: { label: string; tz: string }[] = [
  { label: "LA", tz: "America/Los_Angeles" },
  { label: "LDN", tz: "Europe/London" },
  { label: "NYC", tz: "America/New_York" },
];

function fmt(tz: string, now: Date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(now);
}

/** Live multi-timezone clock — a steven.com-style "operator-grade" micro-detail. */
export function TimeStrip({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] tabular-nums ${className}`} aria-hidden suppressHydrationWarning>
      {ZONES.map((z) => (
        <span key={z.label} className="flex items-center gap-1.5">
          <span className="opacity-50">{z.label}</span>
          <span>{now ? fmt(z.tz, now) : "--:--"}</span>
        </span>
      ))}
    </div>
  );
}
