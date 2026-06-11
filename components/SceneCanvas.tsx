"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type Scene from "./Scene";

const LazyScene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-ink">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-line border-t-acid" />
    </div>
  ),
});

export function SceneCanvas(props: ComponentProps<typeof Scene>) {
  return <LazyScene {...props} />;
}
