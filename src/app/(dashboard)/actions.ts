"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export async function dismissActivity(id: string) {
  await db.delete(activity).where(eq(activity.id, id));
  revalidatePath("/dashboard");
}

export async function dismissAllActivities() {
  const tenant = await getCurrentTenant();
  await db.delete(activity).where(eq(activity.tenantId, tenant.id));
  revalidatePath("/dashboard");
}

export async function createListing(formData: FormData) {
  try {
    const tenant = await getCurrentTenant();

    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const priceStr = formData.get("price")?.toString();
    const status = formData.get("status")?.toString() || "DRAFT";

    // Property details
    const beds = formData.get("beds")?.toString();
    const baths = formData.get("baths")?.toString();
    const sqft = formData.get("sqft")?.toString();
    const yearBuilt = formData.get("yearBuilt")?.toString();
    const propertyType =
      formData.get("propertyType")?.toString() || "apartment";
    const listingType = formData.get("listingType")?.toString() || "sale";

    // Location
    const street = formData.get("street")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const area = formData.get("area")?.toString().trim();
    const postalCode = formData.get("postalCode")?.toString().trim();

    // Images and amenities
    const imagesJson = formData.get("images")?.toString();
    const amenitiesJson = formData.get("amenities")?.toString();

    if (!title || !priceStr) {
      return { success: false, error: "Title and price are required" };
    }

    const price = Number.parseFloat(priceStr);
    if (Number.isNaN(price) || price < 0) {
      return { success: false, error: "Invalid price" };
    }

    const images: string[] = imagesJson ? JSON.parse(imagesJson) : [];
    const amenities: string[] = amenitiesJson ? JSON.parse(amenitiesJson) : [];

    const features = {
      beds: beds ? Number.parseInt(beds, 10) : null,
      baths: baths ? Number.parseInt(baths, 10) : null,
      sqft: sqft ? Number.parseInt(sqft, 10) : null,
      yearBuilt: yearBuilt ? Number.parseInt(yearBuilt, 10) : null,
      propertyType,
      listingType,
      amenities,
    };

    const address = {
      street: street || null,
      city: city || null,
      area: area || null,
      postalCode: postalCode || null,
    };

    const [newListing] = await db
      .insert(listing)
      .values({
        title,
        description,
        price,
        status,
        images: images.length > 0 ? images : null,
        features,
        address,
        tenantId: tenant.id,
      })
      .returning();

    // Create activity for the new listing
    await db.insert(activity).values({
      type: "LISTING_CREATED",
      title: "New listing added",
      description: `${title} was listed`,
      metadata: { listingId: newListing.id, price },
      tenantId: tenant.id,
    });

    revalidatePath("/listings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to create listing:", error);
    return { success: false, error: "Failed to create listing" };
  }
}
