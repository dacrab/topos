"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { activity, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import type { listingSchema } from "@/lib/validations/schemas";

type ListingData = z.infer<typeof listingSchema>;

export async function dismissActivity(id: string) {
  await db.delete(activity).where(eq(activity.id, id));
  revalidatePath("/dashboard");
}

export async function dismissAllActivities() {
  const tenant = await getCurrentTenant();
  await db.delete(activity).where(eq(activity.tenantId, tenant.id));
  revalidatePath("/dashboard");
}

function parseRawListingFields(formData: FormData) {
  const imagesJson = formData.get("images")?.toString();
  const amenitiesJson = formData.get("amenities")?.toString();
  return {
    title: formData.get("title")?.toString().trim(),
    description: formData.get("description")?.toString().trim() || undefined,
    price: formData.get("price")?.toString(),
    status: formData.get("status")?.toString() || "DRAFT",
    beds: formData.get("beds")?.toString() || undefined,
    baths: formData.get("baths")?.toString() || undefined,
    sqft: formData.get("sqft")?.toString() || undefined,
    yearBuilt: formData.get("yearBuilt")?.toString() || undefined,
    propertyType: formData.get("propertyType")?.toString() || "apartment",
    listingType: formData.get("listingType")?.toString() || "sale",
    street: formData.get("street")?.toString().trim() || undefined,
    city: formData.get("city")?.toString().trim() || undefined,
    area: formData.get("area")?.toString().trim() || undefined,
    postalCode: formData.get("postalCode")?.toString().trim() || undefined,
    images: imagesJson ? JSON.parse(imagesJson) : [],
    amenities: amenitiesJson ? JSON.parse(amenitiesJson) : [],
  };
}

async function insertListing(data: ListingData, tenantId: string) {
  const [newListing] = await db
    .insert(listing)
    .values({
      title: data.title,
      description: data.description ?? null,
      price: data.price,
      status: data.status,
      images: data.images.length > 0 ? data.images : null,
      features: {
        beds: data.beds ?? null,
        baths: data.baths ?? null,
        sqft: data.sqft ?? null,
        yearBuilt: data.yearBuilt ?? null,
        propertyType: data.propertyType,
        listingType: data.listingType,
        amenities: data.amenities,
      },
      address: {
        street: data.street ?? null,
        city: data.city ?? null,
        area: data.area ?? null,
        postalCode: data.postalCode ?? null,
      },
      tenantId,
    })
    .returning();

  if (!newListing) throw new Error("Failed to create listing");
  return newListing;
}

async function logListingActivity(
  tenantId: string,
  listingId: string,
  title: string,
  price: number,
) {
  await db.insert(activity).values({
    type: "LISTING_CREATED",
    title: "New listing added",
    description: `${title} was listed`,
    metadata: { listingId, price },
    tenantId,
  });
}

export async function createListing(formData: FormData) {
  try {
    const tenant = await getCurrentTenant();
    const raw = parseRawListingFields(formData);
    const { listingSchema: schema } = await import("@/lib/validations/schemas");
    const result = schema.safeParse(raw);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const data = result.data;
    const newListing = await insertListing(data, tenant.id);
    await logListingActivity(tenant.id, newListing.id, data.title, data.price);

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server error logging
    console.error("Failed to create listing:", error);
    return { success: false, error: "Failed to create listing" };
  }
}
