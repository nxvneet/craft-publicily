import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Server Supabase client (reads the auth cookie). Null in fallback mode. */
export async function getServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component — safe to ignore
        }
      },
    },
  });
}
