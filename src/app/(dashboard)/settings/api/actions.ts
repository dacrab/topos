"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { apiKey, webhook } from "@/db/schema";
import { withAdmin } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";

export async function generateApiKey(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const name = formData.get("name")?.toString().trim();
    if (!name) return { success: false, message: "Name is required" };

    const key = `tok_${crypto.randomUUID().replace(/-/g, "")}`;
    await db.insert(apiKey).values({ key, name, tenantId });
    revalidatePath("/settings/api");
    return { success: true, message: key };
  });
}

export async function deleteApiKey(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const id = formData.get("id")?.toString();
    if (!id) return { success: false, message: "ID required" };
    await db.delete(apiKey).where(and(eq(apiKey.id, id), eq(apiKey.tenantId, tenantId)));
    revalidatePath("/settings/api");
    return { success: true, message: "API key deleted" };
  });
}

export async function createWebhook(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const url = formData.get("url")?.toString().trim();
    const events = formData.getAll("events").map(String);
    if (!url || events.length === 0)
      return { success: false, message: "URL and at least one event required" };

    const secret = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;
    await db.insert(webhook).values({ url, events, secret, tenantId });
    revalidatePath("/settings/api");
    return { success: true, message: "Webhook created" };
  });
}

export async function deleteWebhook(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const id = formData.get("id")?.toString();
    if (!id) return { success: false, message: "ID required" };
    await db.delete(webhook).where(and(eq(webhook.id, id), eq(webhook.tenantId, tenantId)));
    revalidatePath("/settings/api");
    return { success: true, message: "Webhook deleted" };
  });
}

export async function toggleWebhook(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
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
  });
}
