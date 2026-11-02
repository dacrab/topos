import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { z } from "zod";
import { tenant } from "@/db/schema";
import { db } from "@/lib/db";
import { getPlan, PLANS } from "@/lib/plans";

type WebhookHeaders = {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
};

/**
 * Polar secrets created before 2026-09-08 use a legacy key derivation:
 * base64-encode the whole `whsec_…` string before verifying. Newer secrets are
 * passed as-is. Standard Webhooks verifies the id, timestamp, and body together
 * and enforces the replay window.
 */
function verifySignature(payload: string, headers: Headers, secret: string): unknown {
  const webhookHeaders: WebhookHeaders = {
    "webhook-id": headers.get("webhook-id") ?? "",
    "webhook-timestamp": headers.get("webhook-timestamp") ?? "",
    "webhook-signature": headers.get("webhook-signature") ?? "",
  };

  for (const candidate of [secret, Buffer.from(secret, "utf8").toString("base64")]) {
    try {
      return new Webhook(candidate).verify(payload, webhookHeaders);
    } catch {
      // Try the legacy key derivation next.
    }
  }

  throw new Error("Invalid webhook signature");
}

const customerMetadataSchema = z.record(z.string(), z.string()).optional();

const checkoutDataSchema = z.object({
  status: z.string().optional(),
  customer_metadata: customerMetadataSchema,
  subscription_id: z.string().nullish(),
  customer_id: z.string().nullish(),
  current_period_end: z.string().nullish(),
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

  // Metadata is written by us at checkout creation, but resolve it through the
  // catalog anyway (as handleSubscriptionActive does) so a stale or hand-crafted
  // value can never persist a tier the tenant has no Polar product for.
  const plan = planId ? getPlan(planId) : undefined;
  const periodEnd = eventData.current_period_end;

  await db
    .update(tenant)
    .set({
      plan: plan?.productId ? plan.id : "free",
      status: "active",
      polarSubscriptionId: eventData.subscription_id ?? "",
      polarCustomerId: eventData.customer_id ?? "",
      // Taken from the event, never derived from the clock: Polar retries
      // deliveries, so a `Date.now()`-based value would push the period end a
      // further term into the future on every retry. Absent means "leave as is"
      // (Drizzle skips `undefined`).
      currentPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
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
  let payload: unknown;
  try {
    payload = verifySignature(body, req.headers, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
