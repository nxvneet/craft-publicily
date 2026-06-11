import { Reveal } from "./primitives";

const OLD = [
  "Pick a preset or write a prompt",
  "Wait for an 8-second video to render",
  "System extracts ~400 frames",
  "Tune frame-rate for scroll speed",
  "Open the builder and edit copy",
  "Export a ZIP, then host it yourself",
];

const NEW = ["Type one sentence", "Watch it render live", "Click publish"];

export function Compare() {
  return (
    <section className="border-y border-ink-line bg-ink-soft px-6 py-28 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
        <Reveal>
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-cream-dim">
            / the old way — 6 steps, minutes of waiting
          </p>
          <ul className="space-y-4">
            {OLD.map((s, i) => (
              <li key={i} className="flex items-center gap-4 text-lg text-cream-dim/70 line-through decoration-flame/50">
                <span className="font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-acid">
            / the voxel way — 3 clicks, zero waiting
          </p>
          <ul className="space-y-4">
            {NEW.map((s, i) => (
              <li key={i} className="flex items-center gap-4 text-2xl font-medium md:text-3xl">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-acid font-mono text-sm text-ink">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-sm text-cream-dim">
            Same outcome a million-dollar product charges for — minus the render
            queue, the frame math, and five extra screens.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
