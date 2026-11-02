"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { listing } from "@/db/schema";
import { actionMessages } from "@/lib/action-messages";
import { withTenant } from "@/lib/action-wrapper";
import { type ActivityType, logActivity, logAudit } from "@/lib/activity";
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
    status: get("status") || "DRAFT",
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
    const t = await actionMessages();
    const hit = await checkPlanLimit(tenantId, "listings");
    if (hit) return { success: false, message: await planLimitMessage(hit) };

    const parsed = parseListingForm(formData);
    if (!parsed.success) return validationError(parsed.error);
    const data = parsed.data;

    const [newListing] = await db
      .insert(listing)
      .values({ ...data, tenantId })
      .returning();

    if (!newListing) return { success: false, message: t("listingCreateFailed") };

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

    return { success: true, message: t("listingCreated") };
  });
}
