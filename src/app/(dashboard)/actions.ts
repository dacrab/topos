"use server";

import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export async function createListing(formData: FormData) {
  try {
    const tenant = await getCurrentTenant();
    const get = (k: string) => formData.get(k)?.toString().trim() || null;
    const getNum = (k: string) => {
      const v = get(k);
      return v ? Number(v) : null;
    };
    
    const title = get("title");
    if (!title) return { success: false, error: "Title is required" };
    
    const price = getNum("price");
    if (!price || price <= 0) return { success: false, error: "Valid price required" };
    
    const images = formData.get("images")?.toString();
    const amenities = formData.get("amenities")?.toString();
    
    const [newListing] = await db.insert(listing).values({
      title,
      description: get("description"),
      price,
      status: (get("status") as "DRAFT" | "PUBLISHED") || "DRAFT",
      images: images ? JSON.parse(images) : null,
      features: {
        beds: getNum("beds"),
        baths: getNum("baths"),
        sqft: getNum("sqft"),
        yearBuilt: getNum("yearBuilt"),
        propertyType: get("propertyType") || "apartment",
        listingType: get("listingType") || "sale",
        amenities: amenities ? JSON.parse(amenities) : [],
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
