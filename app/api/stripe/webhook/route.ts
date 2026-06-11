import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function setPlan(userId: string | null, plan: string, customerId?: string | null) {
  if (!userId) return;
  const admin = getAdminClient();
  if (!admin) return; // fallback mode — nothing to persist server-side
  await admin
    .from("profiles")
    .upsert({ id: userId, plan, stripe_customer_id: customerId ?? null, updated_at: new Date().toISOString() });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return NextResponse.json({ received: true, demo: true });
  }

  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", whSecret);
  } catch (e) {
    return NextResponse.json(
      { error: `signature: ${e instanceof Error ? e.message : "bad"}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      await setPlan(
        s.metadata?.userId || s.client_reference_id || null,
        s.metadata?.plan || "studio",
        typeof s.customer === "string" ? s.customer : null
      );
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setPlan(sub.metadata?.userId || null, "free", null);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const active = sub.status === "active" || sub.status === "trialing";
      await setPlan(sub.metadata?.userId || null, active ? sub.metadata?.plan || "studio" : "free");
      break;
    }
  }

  return NextResponse.json({ received: true });
}
