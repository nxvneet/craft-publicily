"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Builder } from "@/components/Builder";

function CreateInner() {
  const params = useSearchParams();
  const prompt = params.get("p") ?? "";
  return <Builder initialPrompt={prompt} />;
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-[100svh] place-items-center bg-ink">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-line border-t-acid" />
        </div>
      }
    >
      <CreateInner />
    </Suspense>
  );
}
