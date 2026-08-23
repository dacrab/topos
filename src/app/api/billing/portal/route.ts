import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { tenant } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { getPortalUrl } from "@/lib/polar";

export async function GET() {
  const { tenantId } = await requireTenant();

  const [sub] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);

  return NextResponse.json({
    plan: sub?.plan ?? "free",
    status: sub?.status ?? "active",
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    url: sub?.polarCustomerId ? getPortalUrl(sub.polarCustomerId) : null,
  });
}
