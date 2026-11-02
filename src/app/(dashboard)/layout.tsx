import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { activity } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { tenant } = await requireTenant();

  if (!tenant.onboardingCompleted) redirect("/onboarding");

  const activities = await db.query.activity.findMany({
    where: eq(activity.tenantId, tenant.id),
    orderBy: desc(activity.createdAt),
    limit: 5,
  });

  return (
    <DashboardShell tenantName={tenant.name} activities={activities}>
      {children}
    </DashboardShell>
  );
}
