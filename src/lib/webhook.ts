import { eq } from "drizzle-orm";
import { webhook } from "@/db/schema";
import { db } from "./db";

export const WEBHOOK_EVENTS = [
  "listing.created",
  "listing.updated",
  "contact.created",
  "deal.created",
  "deal.stage_changed",
  "deal.closed",
  "appointment.created",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

async function sign(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function dispatchWebhook(
  tenantId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
) {
  const hooks = await db.select().from(webhook).where(eq(webhook.tenantId, tenantId));
  const matching = hooks.filter((h) => h.active && h.events?.includes(event));

  for (const hook of matching) {
    const body = JSON.stringify({ event, data: payload, timestamp: Date.now() });
    sign(hook.secret, body)
      .then((signature) =>
        fetch(hook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Webhook-Signature": signature },
          body,
        }),
      )
      .catch((err) => console.error(`Webhook delivery failed for ${hook.url}:`, err));
  }
}
