const ITEMS = [
  "REAL-TIME WEBGL",
  "ONE-CLICK PUBLISH",
  "NO FRAME STITCHING",
  "EDIT AFTER GENERATE",
  "60FPS ON MOBILE",
  "OWN YOUR CODE",
];

export function Marquee() {
  return (
    <div className="border-y border-ink-line py-6">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="flex items-center gap-8 text-2xl font-medium tracking-tight text-cream-dim md:text-4xl">
            {t}
            <span className="text-acid">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
