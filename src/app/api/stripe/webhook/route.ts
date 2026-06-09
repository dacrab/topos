import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { subscription } from "@/db/schema";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

const PAID_PLANS = [getPlan("pro"), getPlan("enterprise")];

function findPlanByPriceId(priceId: string) {
  return PAID_PLANS.find((p) => p.priceId === priceId);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const tenantId = session.client_reference_id ?? session.metadata?.tenantId;
      const planId = session.metadata?.planId;
      if (tenantId && planId && session.subscription) {
        await db
          .insert(subscription)
          .values({
            tenantId,
            plan: planId,
            status: "active",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
          })
          .onConflictDoUpdate({
            target: subscription.tenantId,
            set: {
              plan: planId,
              status: "active",
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            },
          });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subData = event.data.object as unknown as Record<string, unknown>;
      const subId = subData.id as string;
      const items = subData.items as { data?: Array<{ price?: { id?: string } }> } | undefined;
      const priceId = items?.data?.[0]?.price?.id;
      const matched = priceId ? findPlanByPriceId(priceId) : undefined;
      const periodEnd = subData.current_period_end as number | undefined;
      await db
        .update(subscription)
        .set({
          status: subData.status as string,
          plan: matched?.id ?? "free",
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        })
        .where(eq(subscription.stripeSubscriptionId, subId));
      break;
    }

    case "customer.subscription.deleted": {
      const subData = event.data.object as unknown as Record<string, unknown>;
      await db
        .update(subscription)
        .set({
          plan: "free",
          status: "canceled",
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        })
        .where(eq(subscription.stripeSubscriptionId, subData.id as string));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
