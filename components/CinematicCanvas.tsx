"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type CinematicScene from "./CinematicScene";

const Lazy = dynamic(() => import("./CinematicScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ink" />,
});

export function CinematicCanvas(props: ComponentProps<typeof CinematicScene>) {
  return <Lazy {...props} />;
}
