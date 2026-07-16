import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { tenant } from "@/db/schema";
import { SUBSCRIPTION_PERIOD_DAYS, WEBHOOK_SIGNATURE_MAX_AGE_SECONDS } from "@/lib/config";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const { t: timestamp, v1: sig } = parts;
  if (!timestamp || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > WEBHOOK_SIGNATURE_MAX_AGE_SECONDS)
    return false;

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

function extractTenantId(eventData: Record<string, unknown>): string | null {
  const meta = (eventData.customer_metadata ?? {}) as Record<string, string>;
  return meta.tenant_id ?? null;
}

async function handleCheckoutEvent(eventData: Record<string, unknown>) {
  if (eventData.status !== "succeeded") return;
  const meta = (eventData.customer_metadata ?? {}) as Record<string, string>;
  const tenantId = meta.tenant_id;
  const planId = meta.plan_id;
  if (!tenantId) return;

  await db
    .update(tenant)
    .set({
      plan: planId ?? "free",
      status: "active",
      polarSubscriptionId: String(eventData.subscription_id ?? ""),
      polarCustomerId: String(eventData.customer_id ?? ""),
      currentPeriodEnd: new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 86400 * 1000),
    })
    .where(eq(tenant.id, tenantId));
}

async function handleSubscriptionActive(eventData: Record<string, unknown>) {
  const tenantId = extractTenantId(eventData);
  if (!tenantId) return;

  const productId = typeof eventData.product_id === "string" ? eventData.product_id : undefined;
  const matched = productId ? PLANS.find((p) => p.productId === productId) : undefined;
  const periodEnd =
    typeof eventData.current_period_end === "string" ? eventData.current_period_end : undefined;
  await db
    .update(tenant)
    .set({
      status: String(eventData.status ?? "") || "active",
      plan: matched?.id ?? "free",
      polarCustomerId: String(eventData.customer_id ?? ""),
      currentPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
    })
    .where(eq(tenant.id, tenantId));
}

async function handleSubscriptionCanceled(eventData: Record<string, unknown>) {
  const tenantId = extractTenantId(eventData);
  if (!tenantId) return;

  await db
    .update(tenant)
    .set({
      plan: "free",
      status: "canceled",
      polarSubscriptionId: null,
      currentPeriodEnd: null,
    })
    .where(eq(tenant.id, tenantId));
}

export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
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
      await handleCheckoutEvent(event.data);
      break;
    }
    case "subscription.active":
    case "subscription.updated": {
      await handleSubscriptionActive(event.data);
      break;
    }
    case "subscription.canceled": {
      await handleSubscriptionCanceled(event.data);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
