import { ensureUser, isSupabaseConfigured } from "./supabase/client";
import type { PlanKey } from "./billing";

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "demo"; plan: string; price: number }
  | { status: "error"; message: string };

/** Start checkout for a paid plan. Redirects to Stripe, or signals demo mode. */
export async function startCheckout(plan: PlanKey): Promise<CheckoutResult> {
  let userId: string | undefined;
  if (isSupabaseConfigured()) {
    const user = await ensureUser();
    userId = user?.id;
  }

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, userId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return { status: "redirect", url: data.url };
    }
    if (data.demo) return { status: "demo", plan: data.plan, price: data.price };
    return { status: "error", message: data.error ?? "Checkout unavailable" };
  } catch {
    return { status: "error", message: "Network error" };
  }
}
