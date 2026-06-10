import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subscription } from "@/db/schema";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const { t: timestamp, v1: sig } = parts;
  if (!timestamp || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  return toHex(signed) === sig;
}

function findPlanByProductId(productId?: string) {
  if (!productId) return undefined;
  return PLANS.find((p) => p.productId === productId);
}

export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("webhook-signature") ?? "";
  if (!(await verifySignature(body, sig, secret))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case "checkout.created":
    case "checkout.updated": {
      if (event.data.status === "succeeded") {
        const meta = event.data.customer_metadata as Record<string, string> | undefined;
        const tenantId = meta?.tenant_id;
        const planId = meta?.plan_id;
        if (!tenantId) break;

        await db
          .insert(subscription)
          .values({
            tenantId,
            plan: planId ?? "free",
            status: "active",
            polarSubscriptionId: event.data.subscription_id ?? null,
            polarCustomerId: event.data.customer_id ?? null,
            currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
          })
          .onConflictDoUpdate({
            target: subscription.tenantId,
            set: {
              plan: planId ?? "free",
              status: "active",
              polarSubscriptionId: event.data.subscription_id ?? null,
              polarCustomerId: event.data.customer_id ?? null,
            },
          });
      }
      break;
    }

    case "subscription.active":
    case "subscription.updated": {
      const subData = event.data;
      const meta = subData.customer_metadata as Record<string, string> | undefined;
      const tenantId = meta?.tenant_id;
      if (!tenantId) break;

      const productId = subData.product_id as string | undefined;
      const matched = productId ? findPlanByProductId(productId) : undefined;
      const periodEnd = subData.current_period_end as string | undefined;
      await db
        .update(subscription)
        .set({
          status: subData.status ?? "active",
          plan: matched?.id ?? "free",
          polarCustomerId: subData.customer_id ?? null,
          currentPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
        })
        .where(eq(subscription.tenantId, tenantId));
      break;
    }

    case "subscription.canceled": {
      const subData = event.data;
      const meta = subData.customer_metadata as Record<string, string> | undefined;
      const tenantId = meta?.tenant_id;
      if (!tenantId) break;

      await db
        .update(subscription)
        .set({
          plan: "free",
          status: "canceled",
          polarSubscriptionId: null,
          currentPeriodEnd: null,
        })
        .where(eq(subscription.tenantId, tenantId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
