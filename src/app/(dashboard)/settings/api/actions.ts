"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiKey, webhook } from "@/db/schema";
import { withTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { validationError } from "@/lib/validation";
import { WEBHOOK_EVENTS } from "@/lib/webhook";

const webhookInputSchema = z.object({
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), "Webhook URL must be HTTPS"),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, "Select at least one event"),
});

export async function generateApiKey(formData: FormData) {
  return withTenant(
    async ({ tenantId }) => {
      const name = formData.get("name")?.toString().trim();
      if (!name) return { success: false, message: "Name is required" };

      const key = `tok_${crypto.randomUUID().replace(/-/g, "")}`;
      await db.insert(apiKey).values({ key, name, tenantId });
      revalidatePath("/settings/api");
      return {
        success: true,
        message: "API key generated - copy it now, it won't be shown again",
        data: { key },
      } as const;
    },
    { admin: true },
  );
}

export async function deleteApiKey(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const id = formData.get("id")?.toString();
      if (!id) return { success: false, message: "ID required" };
      await db.delete(apiKey).where(and(eq(apiKey.id, id), eq(apiKey.tenantId, tenantId)));
      revalidatePath("/settings/api");
      return { success: true, message: "API key deleted" };
    },
    { admin: true },
  );
}

export async function createWebhook(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const parsed = webhookInputSchema.safeParse({
        url: formData.get("url")?.toString().trim() ?? "",
        events: formData.getAll("events").map(String),
      });
      if (!parsed.success) return validationError(parsed.error);

      const secret = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;
      await db
        .insert(webhook)
        .values({ url: parsed.data.url, events: parsed.data.events, secret, tenantId });
      revalidatePath("/settings/api");
      return { success: true, message: "Webhook created" };
    },
    { admin: true },
  );
}

export async function deleteWebhook(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const id = formData.get("id")?.toString();
      if (!id) return { success: false, message: "ID required" };
      await db.delete(webhook).where(and(eq(webhook.id, id), eq(webhook.tenantId, tenantId)));
      revalidatePath("/settings/api");
      return { success: true, message: "Webhook deleted" };
    },
    { admin: true },
  );
}

export async function toggleWebhook(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const id = formData.get("id")?.toString();
      if (!id) return { success: false, message: "ID required" };
      const [existing] = await db
        .select()
        .from(webhook)
        .where(and(eq(webhook.id, id), eq(webhook.tenantId, tenantId)))
        .limit(1);
      if (!existing) return { success: false, message: "Webhook not found" };
      await db
        .update(webhook)
        .set({ active: !existing.active })
        .where(and(eq(webhook.id, id), eq(webhook.tenantId, tenantId)));
      revalidatePath("/settings/api");
      return { success: true, message: existing.active ? "Webhook disabled" : "Webhook enabled" };
    },
    { admin: true },
  );
}
