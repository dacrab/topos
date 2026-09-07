"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { listing } from "@/db/schema";
import { withTenant } from "@/lib/action-wrapper";
import { type ActivityType, logActivity, logAudit } from "@/lib/activity";
import type { ListingStatus } from "@/lib/config";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";
import { checkPlanLimit, planLimitMessage } from "@/lib/plans";
import type { ActionResult } from "@/lib/types";
import { createListingSchema, validationError } from "@/lib/validation";
import { dispatchWebhook } from "@/lib/webhook";

function parseListingForm(formData: FormData) {
  const { get, getNum, getJson } = parseFormData(formData);
  return createListingSchema.safeParse({
    title: get("title"),
    description: get("description"),
    price: getNum("price") ?? 0,
    status: (get("status") ?? "DRAFT") as ListingStatus,
    images: getJson("images", [], z.array(z.string())),
    features: {
      beds: getNum("beds"),
      baths: getNum("baths"),
      sqft: getNum("sqft"),
      yearBuilt: getNum("yearBuilt"),
      propertyType: get("propertyType") || "apartment",
      listingType: get("listingType") || "sale",
      amenities: getJson("amenities", [], z.array(z.string())),
    },
    address: {
      street: get("street"),
      city: get("city"),
      area: get("area"),
      postalCode: get("postalCode"),
    },
  });
}

export async function createListing(formData: FormData): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const hit = await checkPlanLimit(tenantId, "listings");
    if (hit) return { success: false, message: await planLimitMessage(hit) };

    const parsed = parseListingForm(formData);
    if (!parsed.success) return validationError(parsed.error);
    const data = parsed.data;

    const [newListing] = await db
      .insert(listing)
      .values({ ...data, tenantId })
      .returning();

    if (!newListing) return { success: false, message: "Failed to create listing" };

    await logActivity({
      tenantId,
      type: "LISTING_CREATED" satisfies ActivityType,
      title: "New listing added",
      description: `${data.title} was listed`,
      listingId: newListing.id,
    });
    await logAudit({
      tenantId,
      action: "CREATE",
      entity: "listing",
      entityId: newListing.id,
    });
    await dispatchWebhook(tenantId, "listing.created", {
      id: newListing.id,
      title: newListing.title,
      price: newListing.price,
    });

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing created successfully" };
  });
}

export async function updateListing(id: string, formData: FormData): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const parsed = parseListingForm(formData);
    if (!parsed.success) return validationError(parsed.error);

    const [updated] = await db
      .update(listing)
      .set({ ...parsed.data })
      .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
      .returning();

    if (!updated) return { success: false, message: "Listing not found or access denied" };

    await logAudit({ tenantId, action: "UPDATE", entity: "listing", entityId: id });
    await dispatchWebhook(tenantId, "listing.updated", { id: updated.id });

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing updated successfully" };
  });
}

export async function deleteListing(id: string): Promise<ActionResult> {
  return withTenant(async ({ userId, tenantId }) => {
    const [deleted] = await db
      .delete(listing)
      .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
      .returning();

    if (!deleted) return { success: false, message: "Listing not found or access denied" };

    await logAudit({
      tenantId,
      userId,
      action: "DELETE",
      entity: "listing",
      entityId: id,
    });

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing deleted successfully" };
  });
}

export async function toggleListingStatus(id: string): Promise<ActionResult & { status?: string }> {
  return withTenant(async ({ tenantId }) => {
    const [existing] = await db
      .select()
      .from(listing)
      .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
      .limit(1);

    if (!existing) return { success: false, message: "Listing not found or access denied" };

    const newStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await db.update(listing).set({ status: newStatus }).where(eq(listing.id, id));

    await logAudit({ tenantId, action: "UPDATE", entity: "listing", entityId: id });
    await dispatchWebhook(tenantId, "listing.updated", { id, status: newStatus });

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing status updated", status: newStatus };
  });
}
