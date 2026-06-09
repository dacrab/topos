import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subscription } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const { tenantId } = await requireDashboardAuth();

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.tenantId, tenantId))
    .limit(1);

  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: "No customer ID found" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
