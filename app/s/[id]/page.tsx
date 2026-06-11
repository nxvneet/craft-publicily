import type { Metadata } from "next";
import { PublishedSite } from "@/components/PublishedSite";
import { SiteRenderer } from "@/components/SiteRenderer";
import { getServerClient } from "@/lib/supabase/server";
import { decodeConfig } from "@/lib/refine";
import type { SceneConfig } from "@/lib/scenes";
import { generateSiteSpec, isSiteSpec, type SiteSpec } from "@/lib/siteSpec";
import { getPlan } from "@/lib/billing";

export const dynamic = "force-dynamic";

type Resolved = { kind: "spec"; spec: SiteSpec; watermark: boolean } | { kind: "scene"; config: SceneConfig; watermark: boolean };

async function resolveSite(id: string, d?: string): Promise<Resolved> {
  const sb = await getServerClient();
  if (sb) {
    const { data } = await sb.from("sites").select("config, owner").eq("id", id).single();
    if (data?.config) {
      let watermark = true;
      if (data.owner) {
        const { data: profile } = await sb.from("profiles").select("plan").eq("id", data.owner).single();
        watermark = getPlan(profile?.plan).watermark;
      }
      const cfg = data.config;
      return isSiteSpec(cfg)
        ? { kind: "spec", spec: cfg, watermark }
        : { kind: "scene", config: cfg as SceneConfig, watermark };
    }
  }
  if (d) {
    const decoded = decodeConfig(d) as unknown;
    if (isSiteSpec(decoded)) return { kind: "spec", spec: decoded, watermark: true };
    if (decoded) return { kind: "scene", config: decoded as SceneConfig, watermark: true };
  }
  return { kind: "spec", spec: generateSiteSpec("a living 3d website"), watermark: true };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ d?: string }> }): Promise<Metadata> {
  const { d } = await searchParams;
  const decoded = d ? (decodeConfig(d) as unknown) : null;
  if (isSiteSpec(decoded)) return { title: `${decoded.brand.name} — built with Voxel`, description: decoded.brand.tagline };
  return { title: "Built with Voxel", description: "A living 3D website." };
}

export default async function PublishedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { id } = await params;
  const { d } = await searchParams;
  const r = await resolveSite(id, d);
  if (r.kind === "spec") return <SiteRenderer spec={r.spec} watermark={r.watermark} />;
  return <PublishedSite config={r.config} watermark={r.watermark} />;
}
