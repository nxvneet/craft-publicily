import { Reveal, RevealWords } from "./primitives";

const FEATURES = [
  {
    n: "01",
    title: "Prompt to scene, instantly",
    body: "Type a sentence. Voxel reads intent — mood, palette, geometry, motion — and renders a live 3D scene in under a second. No render queue, no waiting.",
  },
  {
    n: "02",
    title: "Scroll is the camera",
    body: "Visitors don't watch a video — they drive one. Scroll position maps to a real camera path, so it's crisp at any speed and any screen size.",
  },
  {
    n: "03",
    title: "Editable after the fact",
    body: "Because it's a live scene, not baked frames, everything stays tweakable. Recolor, reshape, re-pace — in real time, long after generation.",
  },
  {
    n: "04",
    title: "Ships as clean code",
    body: "Export semantic HTML, your own components, and the WebGL scene. Or publish to a voxel.site subdomain in a single click. You own all of it.",
  },
];

export function Features() {
  return (
    <section className="px-6 py-28 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cream-dim">/ why it's different</p>
        <h2 className="max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-7xl">
          <RevealWords text="Draftly ships you a movie." />
          <br />
          <span className="font-serif italic clip-text">
            <RevealWords text="Voxel ships you a world." delay={0.2} />
          </span>
        </h2>

        <div className="mt-20 grid gap-x-16 gap-y-14 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} delay={i * 0.05} className="border-t border-ink-line pt-6">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-acid">{f.n}</span>
                <h3 className="text-2xl font-medium tracking-tight md:text-3xl">{f.title}</h3>
              </div>
              <p className="mt-4 max-w-md pl-10 text-cream-dim md:text-lg">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
