import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { apiKey, listing } from "@/db/schema";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const key = request.headers.get("X-API-Key");
  if (!key) return NextResponse.json({ error: "Missing X-API-Key header" }, { status: 401 });

  const [found] = await db.select().from(apiKey).where(eq(apiKey.key, key)).limit(1);
  if (!found) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  await db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, found.id));

  const listings = await db.select().from(listing).where(eq(listing.tenantId, found.tenantId));
  return NextResponse.json({ data: listings });
}
