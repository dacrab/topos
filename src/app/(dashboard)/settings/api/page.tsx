import { eq } from "drizzle-orm";
import { apiKey, webhook } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { WEBHOOK_EVENTS } from "@/lib/webhook";
import { ApiSettingsClient } from "./client";

export default async function ApiSettingsPage() {
  const { tenantId } = await requireTenant();
  const [keys, hooks] = await Promise.all([
    db.select().from(apiKey).where(eq(apiKey.tenantId, tenantId)),
    db.select().from(webhook).where(eq(webhook.tenantId, tenantId)),
  ]);

  return (
    <ApiSettingsClient
      keys={keys.map((k) => ({ id: k.id, name: k.name, keyLast4: k.key.slice(-4) }))}
      hooks={hooks.map((h) => ({ id: h.id, url: h.url, events: h.events ?? [], active: h.active }))}
      events={[...WEBHOOK_EVENTS]}
    />
  );
}
