"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import type { ListingStatus } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";
import { createListingSchema } from "@/lib/validation";

export async function createListing(formData: FormData) {
  const tenant = await getCurrentTenant();
  const { get, getNum, getJson } = parseFormData(formData);

  const data = createListingSchema.parse({
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

  const [newListing] = await db
    .insert(listing)
    .values({
      ...data,
      tenantId: tenant.id,
    })
    .returning();

  if (!newListing) throw new Error("Failed to create listing");

  await db.insert(activity).values({
    type: "LISTING_CREATED",
    title: "New listing added",
    description: `${data.title} was listed`,
    tenantId: tenant.id,
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function updateListing(id: string, formData: FormData) {
  const tenant = await getCurrentTenant();
  const { get, getNum, getJson } = parseFormData(formData);

  const data = createListingSchema.parse({
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

  const [updated] = await db
    .update(listing)
    .set({ ...data })
    .where(and(eq(listing.id, id), eq(listing.tenantId, tenant.id)))
    .returning();

  if (!updated) throw new Error("Listing not found or access denied");

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function deleteListing(id: string) {
  const tenant = await getCurrentTenant();

  const [deleted] = await db
    .delete(listing)
    .where(and(eq(listing.id, id), eq(listing.tenantId, tenant.id)))
    .returning();

  if (!deleted) throw new Error("Listing not found or access denied");

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function toggleListingStatus(id: string) {
  const tenant = await getCurrentTenant();

  const [existing] = await db
    .select()
    .from(listing)
    .where(and(eq(listing.id, id), eq(listing.tenantId, tenant.id)))
    .limit(1);

  if (!existing) throw new Error("Listing not found or access denied");

  const newStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await db.update(listing).set({ status: newStatus }).where(eq(listing.id, id));

  revalidatePath("/listings");
  revalidatePath("/dashboard");

  return { success: true as const, status: newStatus };
}
