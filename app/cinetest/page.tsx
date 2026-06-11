"use client";

import { useState } from "react";
import { CinematicCanvas } from "@/components/CinematicCanvas";

const IMAGES = ["/cine/bloom.png", "/cine/studio.png", "/cine/cyber.png"];

export default function CineTest() {
  const [i, setI] = useState(0);
  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <CinematicCanvas image={IMAGES[i]} interactive amp={0.8} />
      <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-cream/70">Voxel · cinematic webgl</p>
          <h1 className="mt-4 text-[12vw] font-medium leading-[0.85] tracking-[-0.04em] text-cream md:text-[8vw]">Make it move.</h1>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {IMAGES.map((_, n) => (
          <button key={n} onClick={() => setI(n)} className={`h-2 w-2 rounded-full ${i === n ? "bg-acid" : "bg-cream/30"}`} />
        ))}
      </div>
    </main>
  );
}
