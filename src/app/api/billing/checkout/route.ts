import { NextResponse } from "next/server";
import { requireDashboardAuth } from "@/lib/page-helpers";
import { getPlan } from "@/lib/plans";
import { createCheckout } from "@/lib/polar";

export async function POST(req: Request) {
  const { tenantId } = await requireDashboardAuth();
  const { planId } = (await req.json()) as { planId: string };
  const plan = getPlan(planId);
  if (!plan.productId) {
    return NextResponse.json({ error: "Free plan cannot be purchased" }, { status: 400 });
  }

  const checkout = await createCheckout({
    productId: plan.productId,
    tenantId,
    planId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
  });

  return NextResponse.json({ url: checkout.url });
}
