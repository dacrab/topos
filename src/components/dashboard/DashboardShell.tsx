"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { NotificationPopover } from "@/components/dashboard/NotificationPopover";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import type { ActivitySelect } from "@/db/schema";

export function DashboardShell({
  tenantName,
  activities,
  children,
}: {
  tenantName: string;
  activities: ActivitySelect[];
  children: ReactNode;
}) {
  const t = useTranslations("Common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-background text-foreground">
      <Sidebar className="hidden lg:flex" />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64 max-w-[82vw] border-r border-sidebar-border shadow-elevated">
            <Sidebar forceExpanded onNavigate={() => setMobileOpen(false)} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("close")}
              className="absolute right-2 top-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("openMenu")}
              aria-expanded={mobileOpen}
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="hidden micro-caps text-muted-foreground sm:inline">
              {t("workspace")}
            </span>
            <span aria-hidden className="hidden h-3 w-px bg-border sm:block" />
            <span className="truncate font-display text-base tracking-[-0.01em] text-foreground">
              {tenantName}
            </span>
          </div>

          <div className="flex items-center divide-x divide-border">
            <LocaleSwitcher className="h-8 px-2" />
            <ThemeControls className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground" />
            <NotificationPopover activities={activities} />
          </div>
        </header>

        <main key={pathname} className="relative flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full w-full max-w-[88rem] px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
