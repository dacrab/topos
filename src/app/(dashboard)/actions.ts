"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import { withDashboardAuth } from "@/lib/action-wrapper";
import type { ListingStatus } from "@/lib/config";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";
import { checkPlanLimit } from "@/lib/plans";
import type { ActionResult } from "@/lib/types";
import { createListingSchema } from "@/lib/validation";

function parseListingForm(formData: FormData) {
  const { get, getNum, getJson } = parseFormData(formData);
  return createListingSchema.parse({
    title: get("title"),
    description: get("description"),
    price: getNum("price") ?? 0,
    status: (get("status") as ListingStatus) || "DRAFT",
    images: getJson("images", []),
    features: {
      beds: getNum("beds"),
      baths: getNum("baths"),
      sqft: getNum("sqft"),
      yearBuilt: getNum("yearBuilt"),
      propertyType: get("propertyType") || "apartment",
      listingType: get("listingType") || "sale",
      amenities: getJson("amenities", []),
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
  return withDashboardAuth(async ({ tenantId }) => {
    const limitMessage = await checkPlanLimit(tenantId, "listings");
    if (limitMessage) return { success: false, message: limitMessage };

    const data = parseListingForm(formData);

    const [newListing] = await db
      .insert(listing)
      .values({ ...data, tenantId })
      .returning();

    if (!newListing) return { success: false, message: "Failed to create listing" };

    await db.insert(activity).values({
      type: "LISTING_CREATED",
      title: "New listing added",
      description: `${data.title} was listed`,
      tenantId,
    });

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing created successfully" };
  });
}

export async function updateListing(id: string, formData: FormData): Promise<ActionResult> {
  return withDashboardAuth(async ({ tenantId }) => {
    const data = parseListingForm(formData);

    const [updated] = await db
      .update(listing)
      .set({ ...data })
      .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
      .returning();

    if (!updated) return { success: false, message: "Listing not found or access denied" };

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing updated successfully" };
  });
}

export async function deleteListing(id: string): Promise<ActionResult> {
  return withDashboardAuth(async ({ tenantId }) => {
    const [deleted] = await db
      .delete(listing)
      .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
      .returning();

    if (!deleted) return { success: false, message: "Listing not found or access denied" };

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing deleted successfully" };
  });
}

export async function toggleListingStatus(id: string): Promise<ActionResult & { status?: string }> {
  return withDashboardAuth(async ({ tenantId }) => {
    const [existing] = await db
      .select()
      .from(listing)
      .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
      .limit(1);

    if (!existing) return { success: false, message: "Listing not found or access denied" };

    const newStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await db.update(listing).set({ status: newStatus }).where(eq(listing.id, id));

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true, message: "Listing status updated", status: newStatus };
  });
}
