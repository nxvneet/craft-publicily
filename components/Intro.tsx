"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Intro() {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("voxel.intro")) {
      setShow(false);
      return;
    }
    let n = 0;
    const tick = setInterval(() => {
      n += Math.floor(Math.random() * 18) + 6;
      if (n >= 100) {
        n = 100;
        clearInterval(tick);
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem("voxel.intro", "1");
        }, 450);
      }
      setCount(n);
    }, 130);
    return () => clearInterval(tick);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="intro-autohide fixed inset-0 z-[9997] flex flex-col justify-between bg-ink p-6 md:p-10"
        >
          <div className="flex items-center gap-2.5">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="block h-4 w-4 rotate-45 border-2 border-acid"
            />
            <span className="text-sm font-semibold tracking-tight">VOXEL</span>
          </div>

          <div className="flex items-end justify-between">
            <span className="max-w-xs text-sm text-cream-dim">
              Compiling a real-time world from one sentence…
            </span>
            <span className="font-mono text-[18vw] leading-none tracking-tighter text-cream md:text-[10vw]">
              {String(count).padStart(3, "0")}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
