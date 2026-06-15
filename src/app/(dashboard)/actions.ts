"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { activity, listing, tenant } from "@/db/schema";
import type { ListingStatus } from "@/lib/config";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";
import { requireDashboardAuth } from "@/lib/page-helpers";
import { getPlan } from "@/lib/plans";
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

export async function createListing(formData: FormData) {
  const { tenantId } = await requireDashboardAuth();

  const [[sub], [listingCountRow]] = await Promise.all([
    db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1),
    db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenantId)),
  ]);

  const plan = getPlan(sub?.plan ?? "free");
  const listingCount = listingCountRow?.count ?? 0;
  if (plan.limits.listings !== -1 && listingCount >= plan.limits.listings) {
    throw new Error(
      `Your ${plan.nameKey} plan allows a maximum of ${plan.limits.listings} listings. Upgrade to add more.`,
    );
  }

  const data = parseListingForm(formData);

  const [newListing] = await db
    .insert(listing)
    .values({ ...data, tenantId })
    .returning();

  if (!newListing) throw new Error("Failed to create listing");

  await db.insert(activity).values({
    type: "LISTING_CREATED",
    title: "New listing added",
    description: `${data.title} was listed`,
    tenantId,
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function updateListing(id: string, formData: FormData) {
  const { tenantId } = await requireDashboardAuth();
  const data = parseListingForm(formData);

  const [updated] = await db
    .update(listing)
    .set({ ...data })
    .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
    .returning();

  if (!updated) throw new Error("Listing not found or access denied");

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function deleteListing(id: string) {
  const { tenantId } = await requireDashboardAuth();

  const [deleted] = await db
    .delete(listing)
    .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
    .returning();

  if (!deleted) throw new Error("Listing not found or access denied");

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function toggleListingStatus(id: string) {
  const { tenantId } = await requireDashboardAuth();

  const [existing] = await db
    .select()
    .from(listing)
    .where(and(eq(listing.id, id), eq(listing.tenantId, tenantId)))
    .limit(1);

  if (!existing) throw new Error("Listing not found or access denied");

  const newStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await db.update(listing).set({ status: newStatus }).where(eq(listing.id, id));

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const, status: newStatus };
}
