"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { NotificationPopover } from "@/components/dashboard/NotificationPopover";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { ThemeLocaleControls } from "@/components/ui/language-toggle";
import type { ActivitySelect } from "@/db/schema";

type DashboardHeaderProps = {
  tenantName: string;
  activities: ActivitySelect[];
};

export function DashboardHeader({ tenantName, activities }: DashboardHeaderProps) {
  const t = useTranslations("Common");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background">
      <div className="flex flex-1 items-center h-full">
        <div className="flex flex-col justify-center h-full px-8 border-r border-border min-w-[200px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
            {t("workspace")}
          </span>
          <span className="text-sm font-medium text-foreground tracking-wide uppercase truncate max-w-[180px]">
            {tenantName}
          </span>
        </div>
        <div className="relative flex-1 h-full flex items-center px-6">
          <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search")}
            className="h-full w-full bg-transparent pl-8 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="flex items-center h-full border-l border-border">
        <div className="flex items-center px-4 h-full border-r border-border">
          <NewListingDialog />
        </div>
        <ThemeLocaleControls className="px-6 h-full border-r border-border" />
        <NotificationPopover activities={activities} />
      </div>
    </header>
  );
}
