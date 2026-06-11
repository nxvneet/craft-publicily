import type { SiteSpec } from "./siteSpec";
import { encodeConfig } from "./refine";
import { getBrowserClient, ensureUser, isSupabaseConfigured } from "./supabase/client";

export type SiteRecord = {
  id: string;
  name: string;
  prompt: string;
  spec: SiteSpec;
  url: string;
  created_at: string;
};

const LS_KEY = "voxel.sites";

export function shortId(): string {
  const t = Date.now().toString(36).slice(-5);
  let r = "";
  for (let i = 0; i < 5; i++) r += "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)];
  return t + r;
}

function readLocal(): SiteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(sites: SiteRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sites.slice(0, 50)));
}

/** Publish a generated site. Returns its public URL. */
export async function publishSite(spec: SiteSpec): Promise<string> {
  const id = shortId();
  const origin = window.location.origin;

  if (isSupabaseConfigured()) {
    const sb = getBrowserClient();
    const user = await ensureUser();
    if (sb && user) {
      const { error } = await sb.from("sites").insert({
        id,
        owner: user.id,
        prompt: spec.scene.prompt,
        name: spec.brand.name,
        config: spec,
        published: true,
      });
      if (!error) {
        const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        return root ? `https://${id}.${root}` : `${origin}/s/${id}`;
      }
    }
  }

  // fallback: encode the spec into the URL + remember it locally
  const url = `${origin}/s/${id}?d=${encodeConfig(spec as unknown as never)}`;
  const rec: SiteRecord = {
    id,
    name: spec.brand.name,
    prompt: spec.scene.prompt,
    spec,
    url,
    created_at: new Date().toISOString(),
  };
  writeLocal([rec, ...readLocal()]);
  return url;
}

/** List the current user's sites (DB when configured, else local). */
export async function listMySites(): Promise<SiteRecord[]> {
  if (isSupabaseConfigured()) {
    const sb = getBrowserClient();
    const user = await ensureUser();
    if (sb && user) {
      const { data } = await sb
        .from("sites")
        .select("id,name,prompt,config,created_at")
        .eq("owner", user.id)
        .order("created_at", { ascending: false });
      if (data) {
        return data.map((r) => ({
          id: r.id,
          name: r.name,
          prompt: r.prompt,
          spec: r.config as SiteSpec,
          url: `${window.location.origin}/s/${r.id}`,
          created_at: r.created_at,
        }));
      }
    }
  }
  return readLocal();
}
