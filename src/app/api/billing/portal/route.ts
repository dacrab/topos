import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subscription } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function GET() {
  const { tenantId } = await requireDashboardAuth();

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.tenantId, tenantId))
    .limit(1);

  return NextResponse.json({
    plan: sub?.plan ?? "free",
    status: sub?.status ?? "active",
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
  });
}
