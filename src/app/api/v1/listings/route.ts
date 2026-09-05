import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { apiKey, listing } from "@/db/schema";
import { db } from "@/lib/db";

// Public columns exposed through the API — internal fields (tenantId, agentId)
// stay private; consumers get everything needed to render a listing.
const LISTING_API_COLUMNS = {
  id: listing.id,
  title: listing.title,
  description: listing.description,
  price: listing.price,
  status: listing.status,
  images: listing.images,
  address: listing.address,
  features: listing.features,
  createdAt: listing.createdAt,
  updatedAt: listing.updatedAt,
};

export async function GET(request: Request) {
  const key = request.headers.get("X-API-Key");
  if (!key) return NextResponse.json({ error: "Missing X-API-Key header" }, { status: 401 });

  const [found] = await db
    .select({ tenantId: apiKey.tenantId })
    .from(apiKey)
    .where(eq(apiKey.key, key))
    .limit(1);
  if (!found) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 100);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const listings = await db
    .select(LISTING_API_COLUMNS)
    .from(listing)
    .where(eq(listing.tenantId, found.tenantId))
    .limit(limit)
    .offset(offset);
  return NextResponse.json({ data: listings, limit, offset });
}
