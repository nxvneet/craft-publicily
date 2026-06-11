"use client";

import dynamic from "next/dynamic";
import type { Project } from "@/lib/gallery";

const Lazy = dynamic(() => import("./GalleryScene"), {
  ssr: false,
  loading: () => null,
});

export function SphereGallery({ onOpen }: { onOpen: (p: Project) => void }) {
  return <Lazy onOpen={onOpen} />;
}
