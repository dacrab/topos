"use client";

import { useTranslations } from "next-intl";
import { NotificationPopover } from "@/components/dashboard/NotificationPopover";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { ThemeControls } from "@/components/ui/mode-toggle";
import type { ActivitySelect } from "@/db/schema";

type DashboardHeaderProps = {
  tenantName: string;
  activities: ActivitySelect[];
};

export function DashboardHeader({ tenantName, activities }: DashboardHeaderProps) {
  const t = useTranslations("Common");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background">
      <div className="flex flex-col justify-center h-full px-8 border-r border-border min-w-[200px]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
          {t("workspace")}
        </span>
        <span className="text-sm font-medium text-foreground tracking-wide uppercase truncate max-w-[180px]">
          {tenantName}
        </span>
      </div>

      <div className="flex items-center h-full border-l border-border">
        <div className="flex items-center px-4 h-full border-r border-border">
          <NewListingDialog />
        </div>
        <ThemeControls className="px-6 h-full border-r border-border" />
        <NotificationPopover activities={activities} />
      </div>
    </header>
  );
}
