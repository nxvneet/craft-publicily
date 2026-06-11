import { generateSiteSpec, type SiteSpec } from "./siteSpec";

/** Ask the server to generate a full SiteSpec (Claude-backed when configured),
 *  falling back to the instant deterministic generator on any error. */
export async function aiGenerate(prompt: string): Promise<{ spec: SiteSpec; source: string }> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("generate failed");
    const data = await res.json();
    if (data?.spec) return { spec: data.spec, source: data.source ?? "server" };
    throw new Error("no spec");
  } catch {
    return { spec: generateSiteSpec(prompt), source: "local" };
  }
}
