"use client";

import { useEffect, useRef } from "react";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const move = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor='hover'], input, textarea");
      ring.current?.classList.toggle("hover", !!interactive);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden />
    </>
  );
}
