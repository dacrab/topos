"use client";

import { Bell, Home } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ACTIVITY_ICONS } from "@/components/dashboard/activity-icons";
import { EmptyState } from "@/components/ui/page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActivitySelect } from "@/db/schema";
import type { ActivityType } from "@/lib/activity";
import { activityValue } from "@/lib/activity";
import { formatTime } from "@/lib/format";
import { ACTIVITY_TYPE_LABELS, labelKey } from "@/lib/labels";

const ACTIVITY_LINKS: Record<ActivityType, string> = {
  LISTING_CREATED: "/listings",
  INQUIRY: "/contacts",
  DEAL_CREATED: "/deals",
  DOCUMENT_ADDED: "/documents",
};

export function NotificationPopover({ activities }: { activities: ActivitySelect[] }) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  return (
    <Popover>
      <PopoverTrigger
        className="relative flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
        aria-label={t("notifications")}
        aria-haspopup="dialog"
      >
        <Bell className="h-4 w-4" />
        {activities.length > 0 && (
          <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center bg-accent px-1 font-mono text-[0.5625rem] font-medium tabular-nums text-accent-foreground">
            {activities.length > 9 ? "9+" : activities.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b-2 border-foreground/85 px-4 py-3">
          <h3 className="meta-caps text-foreground">{t("recentActivity")}</h3>
          <span className="font-mono text-micro tabular-nums text-muted-foreground">
            {String(activities.length).padStart(2, "0")}
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <EmptyState className="m-3 p-8 text-xs" icon={<Bell className="h-4 w-4" />}>
              {t("noNotifications")}
            </EmptyState>
          ) : (
            <div>
              {activities.map((a, i) => {
                const Icon = activityValue(a.type, ACTIVITY_ICONS) ?? Home;
                return (
                  <Link
                    key={a.id}
                    href={activityValue(a.type, ACTIVITY_LINKS) ?? "/dashboard"}
                    className="group grid grid-cols-[1.5rem_1.75rem_1fr] items-start gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    <span className="pt-0.5 font-mono text-[0.5625rem] tabular-nums text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-border text-accent transition-colors group-hover:border-foreground">
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm leading-snug text-foreground">
                        {a.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {a.description ?? t(labelKey(ACTIVITY_TYPE_LABELS, a.type))}
                      </span>
                      <span className="mt-1 block micro-caps text-muted-foreground/70">
                        {formatTime(a.createdAt, locale)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
