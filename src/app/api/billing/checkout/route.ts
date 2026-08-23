import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenant } from "@/lib/action-wrapper";
import { appUrl } from "@/lib/config";
import { getPlan } from "@/lib/plans";
import { createCheckout } from "@/lib/polar";

const checkoutSchema = z.object({
  planId: z.string().min(1),
});

export async function POST(req: Request) {
  const { tenantId } = await requireTenant();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { planId } = parsed.data;
  const plan = getPlan(planId);
  if (!plan.productId) {
    return NextResponse.json({ error: "Free plan cannot be purchased" }, { status: 400 });
  }

  const checkout = await createCheckout({
    productId: plan.productId,
    tenantId,
    planId,
    successUrl: `${appUrl()}/settings/billing?success=true`,
    cancelUrl: `${appUrl()}/settings/billing?canceled=true`,
  });

  return NextResponse.json({ url: checkout.url });
}
