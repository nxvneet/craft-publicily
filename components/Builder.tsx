"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SceneCanvas } from "./SceneCanvas";
import { PRESETS, type SceneConfig, type Geometry, type Motion } from "@/lib/scenes";
import { generateSiteSpec, type SiteSpec, type Section } from "@/lib/siteSpec";
import { refineConfig } from "@/lib/refine";
import { aiGenerate } from "@/lib/generateClient";
import { publishSite } from "@/lib/sites";
import { exportHtml } from "@/lib/exportHtml";

const GEOMETRIES: Geometry[] = ["orb", "crystal", "torus", "monolith", "wave"];
const MOTIONS: Motion[] = ["calm", "orbit", "kinetic"];
const SWATCHES = [
  { a: "#d8ff3e", b: "#7b5cff" }, { a: "#3ec8ff", b: "#0a7cff" }, { a: "#ff5c38", b: "#ffb000" },
  { a: "#f5d58a", b: "#b8862f" }, { a: "#ff6fb5", b: "#a45cff" }, { a: "#3effb0", b: "#0aa37a" },
  { a: "#a98bff", b: "#5c3cff" }, { a: "#f4f1ea", b: "#8d8a84" },
];
const REFINE_CHIPS = ["darker", "more energy", "chrome metal", "calmer & sparse", "melt the surface", "glassy"];
type Tab = "customize" | "content" | "ship";

const sectionLabel = (s: Section) => s.type;

export function Builder({ initialPrompt }: { initialPrompt: string }) {
  const [spec, setSpecRaw] = useState<SiteSpec>(() => generateSiteSpec(initialPrompt || "a liquid chrome 3d hero"));
  const config = spec.scene;
  const [prompt, setPrompt] = useState(initialPrompt || config.prompt);
  const [refine, setRefine] = useState("");
  const [tab, setTab] = useState<Tab>("customize");
  const [published, setPublished] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [domain, setDomain] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const didInitial = useRef(false);

  // ── undo / redo history ────────────────────────────────────────────────
  const past = useRef<SiteSpec[]>([]);
  const future = useRef<SiteSpec[]>([]);
  const [, setHist] = useState(0); // bump to re-render toolbar disabled states
  const commit = (next: SiteSpec) => {
    past.current.push(spec);
    if (past.current.length > 50) past.current.shift();
    future.current = [];
    setSpecRaw(next);
    setHist((h) => h + 1);
  };
  const undo = () => {
    const p = past.current.pop();
    if (!p) return;
    future.current.push(spec);
    setSpecRaw(p);
    setHist((h) => h + 1);
  };
  const redo = () => {
    const f = future.current.pop();
    if (!f) return;
    past.current.push(spec);
    setSpecRaw(f);
    setHist((h) => h + 1);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── editors ──────────────────────────────────────────────────────────────
  const setScene = (patch: Partial<SceneConfig>) => commit({ ...spec, scene: { ...spec.scene, ...patch } });
  const setPalette = (a: string, b: string) => commit({ ...spec, scene: { ...spec.scene, palette: { ...spec.scene.palette, a, b } } });
  const setHero = (patch: Partial<SiteSpec["hero"]>) => commit({ ...spec, hero: { ...spec.hero, ...patch } });
  const setBrand = (patch: Partial<SiteSpec["brand"]>) => commit({ ...spec, brand: { ...spec.brand, ...patch } });
  const patchSection = (i: number, patch: Partial<Section>) =>
    commit({ ...spec, sections: spec.sections.map((s, j) => (j === i ? ({ ...s, ...patch } as Section) : s)) });
  const toggleSection = (i: number) => patchSection(i, { hidden: !spec.sections[i].hidden });
  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= spec.sections.length) return;
    const arr = [...spec.sections];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    commit({ ...spec, sections: arr });
  };
  const applyPreset = (p: SceneConfig) =>
    commit({ ...spec, scene: { ...spec.scene, palette: { ...p.palette }, geometry: p.geometry, motion: p.motion, metal: p.metal, rough: p.rough, distort: p.distort, density: p.density, env: p.env } });

  const regenerate = async (p = prompt, note = "⟳ regenerated") => {
    if (!p.trim()) return;
    setGenerating(true);
    const [{ spec: ns, source }] = await Promise.all([aiGenerate(p), new Promise((r) => setTimeout(r, 2100))]);
    past.current.push(spec);
    future.current = [];
    setSpecRaw(ns);
    setHist((h) => h + 1);
    setLog((l) => [`${note} · ${source}`, ...l].slice(0, 5));
    setGenerating(false);
  };
  useEffect(() => {
    if (didInitial.current || !initialPrompt.trim()) return;
    didInitial.current = true;
    regenerate(initialPrompt, "✦ generated from prompt");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyRefine = (text: string) => {
    const t = text.trim();
    if (!t) return;
    commit({ ...spec, scene: refineConfig(spec.scene, t) });
    setLog((l) => [`✦ ${t}`, ...l].slice(0, 5));
    setRefine("");
  };
  const publish = async () => {
    setPublishing(true);
    try {
      setPublished(await publishSite(spec));
    } finally {
      setPublishing(false);
    }
  };
  const download = () => {
    const blob = new Blob([exportHtml(spec)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(spec.brand.name || "site").toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const accent = config.palette.a;

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* live scene */}
      <div className="absolute inset-0">
        <SceneCanvas config={config} autoplay interactive composeLeft />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[6] bg-gradient-to-r from-ink via-ink/55 to-transparent md:via-ink/25" />
      <div className="pointer-events-none absolute inset-0 z-[6] bg-gradient-to-t from-ink/70 via-transparent to-ink/40" />

      {/* editable website preview */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="w-full px-8 md:pl-[26rem] md:pr-12">
          <motion.div
            key={config.id + spec.sections.length}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: generating ? 0 : 1, y: generating ? 24 : 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none max-w-lg"
          >
            <Editable
              value={`${spec.brand.name} · ${spec.hero.eyebrow}`}
              onCommit={(v) => setBrand({ name: v.split("·")[0]?.trim() || spec.brand.name })}
              className="pointer-events-auto inline-block text-[11px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
              single
            />
            <Editable
              value={spec.hero.headline}
              onCommit={(v) => setHero({ headline: v })}
              className="pointer-events-auto mt-4 block text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-cream md:text-7xl"
            />
            <Editable
              value={spec.hero.sub}
              onCommit={(v) => setHero({ sub: v })}
              className="pointer-events-auto mt-5 block max-w-md text-base text-cream/70 md:text-lg"
            />
            <span className="pointer-events-auto mt-7 inline-block rounded-full px-6 py-3 text-sm font-semibold text-ink" style={{ background: accent }}>
              <Editable value={spec.hero.cta} onCommit={(v) => setHero({ cta: v })} className="inline-block" single /> →
            </span>
            <div className="mt-8 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-cream/40">{spec.sections.filter((s) => !s.hidden).length + 2} sections ↓</span>
              {["hero", ...spec.sections.filter((s) => !s.hidden).map((x) => x.type), "footer"].map((t, i) => (
                <span key={i} className="rounded-full border border-ink-line bg-ink/40 px-2 py-0.5 text-[10px] capitalize text-cream/60 backdrop-blur-sm">{t}</span>
              ))}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-cream/30">✎ click any text to edit it</p>
          </motion.div>
        </div>
      </div>

      {/* ── top toolbar ───────────────────────────────────────────────────── */}
      <div className="absolute left-0 top-0 z-30 flex w-full items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Link href="/" data-cursor="hover" className="flex items-center gap-2"><span className="block h-4 w-4 rotate-45 border-2 border-cream" /></Link>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-none text-cream">{spec.brand.name}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-cream-dim">{spec.industry} · {config.geometry}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ToolBtn label="Undo" onClick={undo} disabled={past.current.length === 0}>↺</ToolBtn>
          <ToolBtn label="Redo" onClick={redo} disabled={future.current.length === 0}>↻</ToolBtn>
          <div className="mx-1 h-6 w-px bg-ink-line" />
          <ToolBtn label="Export" onClick={download}>↓</ToolBtn>
          <Link href="/dashboard" data-cursor="hover" className="hairline hidden rounded-full bg-ink/60 px-4 py-2 text-sm backdrop-blur-md sm:block">My sites</Link>
          <button onClick={publish} disabled={publishing} data-cursor="hover" className="noise-btn hairline rounded-full bg-acid px-5 py-2 text-sm font-semibold text-ink disabled:opacity-60">
            {publishing ? "Publishing…" : "Publish ↗"}
          </button>
        </div>
      </div>

      {/* ── left editor panel ─────────────────────────────────────────────── */}
      <aside className="absolute left-4 top-[4.5rem] z-20 flex max-h-[calc(100svh-9.5rem)] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink/80 backdrop-blur-2xl">
        {/* tabs */}
        <div className="flex shrink-0 border-b border-ink-line">
          {(["customize", "content", "ship"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-cursor="hover"
              className={`relative flex-1 py-3.5 text-sm font-medium capitalize transition-colors ${tab === t ? "text-cream" : "text-cream-dim hover:text-cream"}`}
            >
              {t}
              {tab === t && <motion.span layoutId="tabline" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-acid" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "customize" && (
            <div className="flex flex-col gap-6">
              <Group label="Prompt">
                <div className="flex gap-2">
                  <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && regenerate()}
                    className="min-w-0 flex-1 rounded-lg border border-ink-line bg-ink/60 px-3 py-2.5 text-sm text-cream outline-none focus:border-acid/60" />
                  <button onClick={() => regenerate()} disabled={generating} data-cursor="hover" className="shrink-0 rounded-lg bg-cream px-3 text-sm font-semibold text-ink disabled:opacity-60">
                    <span className={generating ? "inline-block animate-spin" : ""}>⟳</span>
                  </button>
                </div>
              </Group>

              <Group label="Palette">
                <div className="flex flex-wrap gap-2.5">
                  {SWATCHES.map((s) => (
                    <button key={s.a} onClick={() => setPalette(s.a, s.b)} data-cursor="hover"
                      className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${config.palette.a === s.a ? "border-cream" : "border-transparent"}`}
                      style={{ background: `linear-gradient(135deg, ${s.a}, ${s.b})` }} />
                  ))}
                </div>
              </Group>

              <Group label="Form">
                <Segmented options={GEOMETRIES} value={config.geometry} onChange={(g) => setScene({ geometry: g as Geometry })} />
              </Group>
              <Group label="Motion">
                <Segmented options={MOTIONS} value={config.motion} onChange={(m) => setScene({ motion: m as Motion })} />
              </Group>

              <Slider label="Density" value={config.density} onChange={(v) => setScene({ density: v })} accent={accent} />
              <Slider label="Distortion" value={config.distort} onChange={(v) => setScene({ distort: v })} accent={accent} />
              <Slider label="Metal" value={config.metal} onChange={(v) => setScene({ metal: v })} accent={accent} />

              <Group label="Refine in words">
                <div className="flex gap-2">
                  <input value={refine} onChange={(e) => setRefine(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyRefine(refine)}
                    placeholder="e.g. darker & chrome" className="min-w-0 flex-1 rounded-lg border border-ink-line bg-ink/60 px-3 py-2.5 text-sm text-cream outline-none focus:border-acid/60 placeholder:text-cream-dim/50" />
                  <button onClick={() => applyRefine(refine)} data-cursor="hover" className="shrink-0 rounded-lg bg-acid px-3 text-sm font-semibold text-ink">↵</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {REFINE_CHIPS.map((c) => (
                    <button key={c} onClick={() => applyRefine(c)} data-cursor="hover" className="rounded-full border border-ink-line px-2.5 py-1 text-[11px] text-cream-dim transition-colors hover:border-cream/40 hover:text-cream">{c}</button>
                  ))}
                </div>
                {log.length > 0 && <ul className="mt-3 space-y-1 text-[11px] text-cream-dim/70">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
              </Group>
            </div>
          )}

          {tab === "content" && (
            <div className="flex flex-col gap-6">
              <Group label="Brand">
                <Field value={spec.brand.name} onChange={(v) => setBrand({ name: v })} placeholder="Brand name" />
                <Field value={spec.brand.tagline} onChange={(v) => setBrand({ tagline: v })} placeholder="Tagline" />
              </Group>
              <Group label="Hero">
                <Field value={spec.hero.eyebrow} onChange={(v) => setHero({ eyebrow: v })} placeholder="Eyebrow" />
                <Field value={spec.hero.headline} onChange={(v) => setHero({ headline: v })} placeholder="Headline" />
                <Field value={spec.hero.sub} onChange={(v) => setHero({ sub: v })} placeholder="Subhead" textarea />
                <Field value={spec.hero.cta} onChange={(v) => setHero({ cta: v })} placeholder="Button" />
              </Group>
              <Group label={`Sections · ${spec.sections.length}`}>
                <div className="flex flex-col gap-1.5">
                  {spec.sections.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg border border-ink-line px-3 py-2 ${s.hidden ? "opacity-40" : ""}`}>
                      <div className="flex flex-col">
                        <button onClick={() => moveSection(i, -1)} data-cursor="hover" className="text-[10px] leading-none text-cream-dim hover:text-cream">▲</button>
                        <button onClick={() => moveSection(i, 1)} data-cursor="hover" className="text-[10px] leading-none text-cream-dim hover:text-cream">▼</button>
                      </div>
                      <span className="flex-1 text-sm capitalize text-cream">{sectionLabel(s)}</span>
                      <button onClick={() => toggleSection(i)} data-cursor="hover" className="text-sm text-cream-dim hover:text-cream" title={s.hidden ? "Show" : "Hide"}>{s.hidden ? "◌" : "●"}</button>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-cream-dim/60">Reorder with ▲▼, toggle visibility with ●. Edit copy by clicking text in the preview.</p>
              </Group>
            </div>
          )}

          {tab === "ship" && (
            <div className="flex flex-col gap-5">
              <p className="text-[13px] leading-relaxed text-cream-dim">Publish to a free <span className="text-cream">voxel.site</span> subdomain, or export the code. Same flow as the builder.</p>
              <div className="rounded-xl border border-acid/30 bg-acid/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-cream"><span style={{ color: accent }}>✦</span> Publish to Voxel</div>
                <p className="mt-1 text-[12px] text-cream-dim">Get a live, shareable URL instantly.</p>
                <button onClick={publish} disabled={publishing} data-cursor="hover" className="mt-3 w-full rounded-lg bg-acid py-2.5 text-sm font-semibold text-ink disabled:opacity-60">{publishing ? "Publishing…" : "Publish now"}</button>
              </div>
              <div className="rounded-xl border border-ink-line p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-cream">🌐 Custom domain</div>
                <p className="mt-1 text-[12px] text-cream-dim">Point your domain at Voxel after publishing.</p>
                <div className="mt-3 flex gap-2">
                  <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="mybrand.com" className="min-w-0 flex-1 rounded-lg border border-ink-line bg-ink/60 px-3 py-2 text-sm text-cream outline-none focus:border-acid/60 placeholder:text-cream-dim/50" />
                  <button onClick={publish} data-cursor="hover" className="hairline shrink-0 rounded-lg px-3 text-sm font-medium text-cream">Connect</button>
                </div>
              </div>
              <button onClick={download} data-cursor="hover" className="hairline rounded-lg py-2.5 text-sm font-medium text-cream">Download HTML ↓</button>
              <button data-cursor="hover" className="hairline rounded-lg py-2.5 text-sm text-cream-dim">Download code · ZIP (Pro)</button>
              <Link href="/#pricing" data-cursor="hover" className="text-center text-[12px] text-cream-dim underline-offset-2 hover:underline">Growth: analytics, billing, forms →</Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── bottom preset rail ────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 z-20 md:left-[25.5rem]">
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-ink-line bg-ink/70 p-2 backdrop-blur-xl [scrollbar-width:none]">
          <span className="shrink-0 px-2 text-[10px] uppercase tracking-[0.2em] text-cream-dim">Styles</span>
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)} data-cursor="hover"
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${config.palette.a === p.palette.a ? "border-cream text-cream" : "border-ink-line text-cream-dim hover:text-cream"}`}>
              <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${p.palette.a}, ${p.palette.b})` }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <GeneratingOverlay show={generating} accent={accent} />

      {/* publish modal */}
      <AnimatePresence>
        {published && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPublished(null)} className="absolute inset-0 z-50 grid place-items-center bg-ink/70 p-6 backdrop-blur-md">
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-ink-line bg-ink-soft p-7 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-acid text-2xl text-ink">✓</div>
              <h3 className="text-2xl font-medium">You&apos;re live.</h3>
              <p className="mt-2 text-sm text-cream-dim">Your site is published. Share the link or open it.</p>
              <div className="mt-5 truncate rounded-lg border border-ink-line bg-ink px-3 py-2 text-left text-xs text-cream-dim">{published}</div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => navigator.clipboard?.writeText(published)} data-cursor="hover" className="hairline flex-1 rounded-lg py-2.5 text-sm font-medium">Copy link</button>
                <a href={published} target="_blank" rel="noreferrer" data-cursor="hover" className="flex-1 rounded-lg bg-acid py-2.5 text-sm font-semibold text-ink">Open live site ↗</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── small components ─────────────────────────────────────────────────────────
function Editable({ value, onCommit, className, style, single }: { value: string; onCommit: (v: string) => void; className?: string; style?: React.CSSProperties; single?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      key={value}
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-cursor="hover"
      onMouseDown={(e) => e.stopPropagation()}
      onBlur={() => {
        const t = (ref.current?.innerText || "").trim();
        if (t && t !== value) onCommit(t);
        else if (ref.current) ref.current.innerText = value;
      }}
      onKeyDown={(e) => {
        if (single && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      className={className}
      style={{ outline: "none", ...style }}
    >
      {value}
    </span>
  );
}

function ToolBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} data-cursor="hover" title={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-ink-line bg-ink/60 text-base text-cream backdrop-blur-md transition-colors hover:bg-ink-soft disabled:opacity-30">
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2.5 block text-[11px] uppercase tracking-[0.2em] text-cream-dim">{label}</span>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} data-cursor="hover"
          className={`rounded-full px-3 py-1.5 text-xs capitalize transition-colors ${value === o ? "bg-cream text-ink" : "border border-ink-line text-cream-dim hover:text-cream"}`}>{o}</button>
      ))}
    </div>
  );
}

function Slider({ label, value, onChange, accent }: { label: string; value: number; onChange: (v: number) => void; accent: string }) {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-cream-dim">{label}</span>
        <span className="text-[11px] text-cream-dim">{Math.round(value * 100)}</span>
      </div>
      <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} data-cursor="hover"
        className="mt-2 w-full" style={{ accentColor: accent }} />
    </div>
  );
}

function Field({ value, onChange, placeholder, textarea }: { value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const common = "w-full rounded-lg border border-ink-line bg-ink/60 px-3 py-2 text-sm text-cream outline-none focus:border-acid/60 placeholder:text-cream-dim/50";
  return textarea ? (
    <textarea value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onChange(v)} placeholder={placeholder} rows={3} className={`${common} resize-none`} />
  ) : (
    <input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onChange(v)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} placeholder={placeholder} className={common} />
  );
}

const GEN_STEPS = ["Reading your brief", "Planning the structure", "Writing the copy", "Art-directing the palette", "Composing the 3D scene"];

function GeneratingOverlay({ show, accent }: { show: boolean; accent: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!show) return setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, GEN_STEPS.length - 1)), 380);
    return () => clearInterval(t);
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-40 grid place-items-center bg-ink/80 backdrop-blur-xl">
          <div className="w-full max-w-sm px-8">
            <div className="mb-6 flex items-center gap-3">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} className="block h-4 w-4 rotate-45 border-2" style={{ borderColor: accent }} />
              <span className="text-sm font-medium text-cream">Generating your site</span>
            </div>
            <ul className="space-y-2.5">
              {GEN_STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${i <= step ? "text-cream" : "text-cream-dim/40"}`}>
                  <span className="grid h-5 w-5 place-items-center rounded-full text-[10px]" style={{ background: i < step ? accent : "transparent", border: i < step ? "none" : "1px solid rgba(255,255,255,0.15)", color: i < step ? "#06060a" : undefined }}>
                    {i < step ? "✓" : i === step ? "•" : ""}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-7 h-px w-full overflow-hidden bg-ink-line">
              <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} className="h-full" style={{ background: accent }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
