import { Reveal } from "./primitives";

type Step = { n: string; title: string; body: string; icon: React.ReactNode };

const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    {d.split("|").map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const STEPS: Step[] = [
  { n: "01", title: "Describe", body: "Tell Voxel the site you want in one plain sentence.", icon: I("M4 7h16|M4 12h10|M4 17h7") },
  { n: "02", title: "Generate", body: "AI writes the copy, plans the sections and art-directs.", icon: I("M12 3v4|M12 17v4|M3 12h4|M17 12h4|M6 6l2 2|M16 16l2 2|M18 6l-2 2|M8 16l-2 2") },
  { n: "03", title: "Render", body: "A real-time, scroll-driven 3D scene appears instantly.", icon: I("M12 2l8 5v10l-8 5-8-5V7z|M12 12l8-5|M12 12v10|M12 12L4 7") },
  { n: "04", title: "Edit", body: "Click any text to rewrite it; tune palette and sections.", icon: I("M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z") },
  { n: "05", title: "Publish", body: "One click to a live, shareable voxel.site URL.", icon: I("M12 19V5|M5 12l7-7 7 7") },
  { n: "06", title: "Own it", body: "Export clean, semantic HTML and the scene anytime.", icon: I("M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2|M12 4v10|M8 10l4 4 4-4") },
];

export function Pipeline() {
  return (
    <section className="border-y border-ink-line px-6 py-24 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-4 text-center text-[11px] uppercase tracking-[0.3em] text-cream-dim">/ from prompt to production</p>
          <h2 className="mx-auto max-w-3xl text-center text-4xl font-medium tracking-[-0.03em] md:text-6xl">
            Six steps. <span className="text-cream-dim">Seconds, not hours.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={(i % 3) * 0.06} className="group">
              <div className="flex items-center gap-3 text-cream-dim transition-colors group-hover:text-acid">
                {s.icon}
                <span className="font-mono text-xs">{s.n}</span>
              </div>
              <h3 className="mt-4 text-2xl font-medium tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-xs text-cream-dim">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
