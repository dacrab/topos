import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

import { NotificationPopover } from "@/components/dashboard/NotificationPopover";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { activity } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { APP_CONFIG, ENABLE_DEMO_ONBOARDING_BYPASS } from "@/lib/config";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { tenant } = await requireTenant();
  const t = await getTranslations("Common");

  if (
    !(
      tenant.onboardingCompleted ||
      (ENABLE_DEMO_ONBOARDING_BYPASS && tenant.slug === APP_CONFIG.demoTenant.slug)
    )
  ) {
    redirect("/onboarding");
  }

  const activities = await db.query.activity.findMany({
    where: eq(activity.tenantId, tenant.id),
    orderBy: desc(activity.createdAt),
    limit: 5,
  });

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/40 bg-background/85 backdrop-blur-2xl">
          <div className="flex flex-col justify-center h-full px-6 min-w-[200px]">
            <span className="mono-micro mb-px">{t("workspace")}</span>
            <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
              {tenant.name}
            </span>
          </div>
          <div className="flex items-center h-full gap-1 px-2">
            <LocaleSwitcher className="px-3 h-7 flex items-center hover:bg-accent/10 transition-colors rounded-full text-sm" />
            <ThemeControls className="px-3 h-7 flex items-center rounded-full hover:bg-accent/10 transition-colors" />
            <NotificationPopover activities={activities} />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background relative">
          <div className="relative min-h-full p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
