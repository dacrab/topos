import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/page";
import { apiKey, webhook } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { WEBHOOK_EVENTS } from "@/lib/webhook";
import { ApiSettingsClient } from "./client";

export default async function ApiSettingsPage() {
  const t = await getTranslations("Settings");
  const { tenantId } = await requireTenant();
  const [keys, hooks] = await Promise.all([
    db.select().from(apiKey).where(eq(apiKey.tenantId, tenantId)),
    db.select().from(webhook).where(eq(webhook.tenantId, tenantId)),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title={t("apiTitle")} description={t("apiDesc")} />
      <ApiSettingsClient
        keys={keys.map((k) => ({ id: k.id, name: k.name, keyLast4: k.key.slice(-4) }))}
        hooks={hooks.map((h) => ({
          id: h.id,
          url: h.url,
          events: h.events ?? [],
          active: h.active,
        }))}
        events={[...WEBHOOK_EVENTS]}
      />
    </div>
  );
}
