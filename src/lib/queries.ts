import { desc, eq } from "drizzle-orm";
import { listing } from "@/db/schema";
import { db } from "./db";

export async function getTenantListings(tenantId: string, limit?: number) {
  const query = db
    .select()
    .from(listing)
    .where(eq(listing.tenantId, tenantId))
    .orderBy(desc(listing.createdAt));
  
  return limit ? query.limit(limit) : query;
}
