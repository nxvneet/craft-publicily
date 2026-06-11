"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

/** Word-by-word reveal on scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "h1" | "h2" | "p";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      ref={ref}
      className={className}
      initial={{ y: 28, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Tag>
  );
}

/** Splits a line into words that stagger up. */
export function RevealWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.04 }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Cursor-following magnetic wrapper for buttons/links. */
export function Magnetic({ children, strength = 0.4 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <motion.span
      ref={ref}
      style={{ display: "inline-block" }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "translate(0,0)";
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.span>
  );
}
