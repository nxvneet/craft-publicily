"use client";

import dynamic from "next/dynamic";

const Lazy = dynamic(() => import("./EditorialGraphic"), { ssr: false, loading: () => null });

export function EditorialCanvas({ className }: { className?: string }) {
  return <Lazy className={className} />;
}
