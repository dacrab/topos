import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subscription } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";
import { getPlan } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { tenantId } = await requireDashboardAuth();
  const { planId } = (await req.json()) as { planId: string };
  const plan = getPlan(planId);
  if (!plan.priceId) {
    return NextResponse.json({ error: "Free plan cannot be purchased" }, { status: 400 });
  }

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.tenantId, tenantId))
    .limit(1);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    client_reference_id: tenantId,
    metadata: { planId, tenantId },
    subscription_data: {
      metadata: { tenantId, planId },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
  });

  if (sub) {
    await db
      .update(subscription)
      .set({ stripeCustomerId: session.customer as string })
      .where(eq(subscription.tenantId, tenantId));
  }

  return NextResponse.json({ url: session.url });
}
