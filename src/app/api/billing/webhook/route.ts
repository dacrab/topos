import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { tenant } from "@/db/schema";
import { SUBSCRIPTION_PERIOD_DAYS, WEBHOOK_SIGNATURE_MAX_AGE_SECONDS } from "@/lib/config";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifySignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const { t: timestamp, v1: sig } = parts;
  if (!(timestamp && sig)) return false;
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
  return timingSafeHexEqual(toHex(signed), sig);
}

const customerMetadataSchema = z.record(z.string(), z.string()).optional();

const checkoutDataSchema = z.object({
  status: z.string().optional(),
  customer_metadata: customerMetadataSchema,
  subscription_id: z.string().nullish(),
  customer_id: z.string().nullish(),
});

const subscriptionDataSchema = z.object({
  status: z.string().optional(),
  product_id: z.string().optional(),
  current_period_end: z.string().optional(),
  customer_id: z.string().nullish(),
  customer_metadata: customerMetadataSchema,
});

const polarEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("checkout.created"), data: checkoutDataSchema }),
  z.object({ type: z.literal("checkout.updated"), data: checkoutDataSchema }),
  z.object({ type: z.literal("subscription.active"), data: subscriptionDataSchema }),
  z.object({ type: z.literal("subscription.updated"), data: subscriptionDataSchema }),
  z.object({ type: z.literal("subscription.canceled"), data: subscriptionDataSchema }),
]);

type CheckoutEventData = z.infer<typeof checkoutDataSchema>;
type SubscriptionEventData = z.infer<typeof subscriptionDataSchema>;

const handledEventTypes = new Set([
  "checkout.created",
  "checkout.updated",
  "subscription.active",
  "subscription.updated",
  "subscription.canceled",
]);

function extractTenantId(eventData: SubscriptionEventData): string | null {
  return eventData.customer_metadata?.tenant_id ?? null;
}

async function handleCheckoutEvent(eventData: CheckoutEventData) {
  if (eventData.status !== "succeeded") return;
  const meta = eventData.customer_metadata ?? {};
  const tenantId = meta.tenant_id;
  const planId = meta.plan_id;
  if (!tenantId) return;

  await db
    .update(tenant)
    .set({
      plan: planId ?? "free",
      status: "active",
      polarSubscriptionId: eventData.subscription_id ?? "",
      polarCustomerId: eventData.customer_id ?? "",
      currentPeriodEnd: new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 86400 * 1000),
    })
    .where(eq(tenant.id, tenantId));
}

async function handleSubscriptionActive(eventData: SubscriptionEventData) {
  const tenantId = extractTenantId(eventData);
  if (!tenantId) return;

  const productId = eventData.product_id;
  const matched = productId ? PLANS.find((p) => p.productId === productId) : undefined;
  const periodEnd = eventData.current_period_end;
  await db
    .update(tenant)
    .set({
      status: eventData.status || "active",
      plan: matched?.id ?? "free",
      polarCustomerId: eventData.customer_id ?? "",
      currentPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
    })
    .where(eq(tenant.id, tenantId));
}

async function handleSubscriptionCanceled(eventData: SubscriptionEventData) {
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

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const envelope = z.object({ type: z.string() }).safeParse(payload);
  if (!envelope.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!handledEventTypes.has(envelope.data.type)) {
    // Event types we don't act on are acknowledged so Polar doesn't retry them.
    return NextResponse.json({ received: true });
  }

  const parsed = polarEventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  switch (parsed.data.type) {
    case "checkout.created":
    case "checkout.updated": {
      await handleCheckoutEvent(parsed.data.data);
      break;
    }
    case "subscription.active":
    case "subscription.updated": {
      await handleSubscriptionActive(parsed.data.data);
      break;
    }
    case "subscription.canceled": {
      await handleSubscriptionCanceled(parsed.data.data);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
