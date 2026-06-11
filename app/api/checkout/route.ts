import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS, type PlanKey } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { plan?: string; userId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body ok */
  }

  const planKey = body.plan as PlanKey;
  const plan = PLANS[planKey];
  if (!plan || plan.key === "free") {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = plan.priceEnv ? process.env[plan.priceEnv] : undefined;

  // Demo mode — keys not configured yet. Tell the client to show the demo notice.
  if (!secret || !priceId) {
    return NextResponse.json({ demo: true, plan: plan.key, price: plan.price });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const stripe = new Stripe(secret);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: body.userId,
      metadata: { plan: plan.key, userId: body.userId ?? "" },
      subscription_data: { metadata: { plan: plan.key, userId: body.userId ?? "" } },
      allow_promotion_codes: true,
      success_url: `${origin}/billing/success?plan=${plan.key}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "checkout failed" },
      { status: 500 }
    );
  }
}
