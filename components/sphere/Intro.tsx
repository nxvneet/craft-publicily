"use client";

import { motion } from "framer-motion";

const EASE = [0.76, 0, 0.24, 1] as const;

/** Cinematic first-load curtain — draws the mark, fills a line, then lifts to
 *  reveal the gallery. Rendered inside <AnimatePresence>; the parent unmounts
 *  it after a beat and the `exit` slides the whole panel up. */
export function Intro() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#050509]"
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.95, ease: EASE } }}
    >
      <div className="flex flex-col items-center">
        <motion.span
          className="block h-10 w-10 border-2 border-acid"
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{ scale: 1, rotate: 45, opacity: 1 }}
          transition={{ duration: 0.85, ease: EASE }}
        />
        <div className="mt-7 overflow-hidden">
          <motion.span
            className="block text-xl font-semibold tracking-[0.42em] text-cream"
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
          >
            VOXEL
          </motion.span>
        </div>
        <div className="mt-7 h-px w-40 overflow-hidden bg-cream/15">
          <motion.div className="h-full bg-acid" initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }} />
        </div>
        <motion.span
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          Entering the gallery
        </motion.span>
      </div>
    </motion.div>
  );
}
