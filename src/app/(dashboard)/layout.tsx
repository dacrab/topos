import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { NotificationPopover } from "@/components/dashboard/NotificationPopover";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { activity } from "@/db/schema";
import { APP_CONFIG } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { session, tenant } = await requireDashboardAuth();

  if (!tenant.onboardingCompleted && tenant.slug !== APP_CONFIG.demoTenant.slug) {
    redirect("/onboarding");
  }

  const activities = await db.query.activity.findMany({
    where: eq(activity.tenantId, tenant.id),
    orderBy: desc(activity.createdAt),
    limit: 5,
  });

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background">
          <div className="flex flex-col justify-center h-full px-8 border-r border-border min-w-[200px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
              Workspace
            </span>
            <span className="text-sm font-medium text-foreground tracking-wide uppercase truncate max-w-[180px]">
              {tenant.name}
            </span>
          </div>
          <div className="flex items-center h-full divide-x divide-border">
            <div className="flex items-center px-4 h-full">
              <NewListingDialog />
            </div>
            <ThemeControls className="px-6 h-full" />
            <NotificationPopover activities={activities} />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] grid-pattern-sm" />
          <div className="relative min-h-full p-8 max-w-[1920px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
