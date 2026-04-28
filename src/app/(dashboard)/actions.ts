"use server";

import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";

export async function createListing(formData: FormData) {
  try {
    const tenant = await getCurrentTenant();
    const { get, getNum, getJson } = parseFormData(formData);
    
    const title = get("title");
    if (!title) return { success: false, error: "Title is required" };
    
    const price = getNum("price");
    if (!price || price <= 0) return { success: false, error: "Valid price required" };
    
    const [newListing] = await db.insert(listing).values({
      title,
      description: get("description"),
      price,
      status: (get("status") as "DRAFT" | "PUBLISHED") || "DRAFT",
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
      tenantId: tenant.id,
    }).returning();

    if (!newListing) throw new Error("Failed to create listing");

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
  } catch {
    return { success: false, error: "Failed to create listing" };
  }
}
