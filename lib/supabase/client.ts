"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/** Browser Supabase client, or null when the app isn't configured (fallback mode). */
export function getBrowserClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && key ? createBrowserClient(url, key) : null;
  return cached;
}

export const isSupabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Ensure there is a session — sign in anonymously (zero-friction accounts). */
export async function ensureUser() {
  const sb = getBrowserClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.user;
  const { data: anon, error } = await sb.auth.signInAnonymously();
  if (error) return null;
  return anon.user;
}
