"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActivitySelect } from "@/db/schema";
import { type ActivityType, activityValue } from "@/lib/activity";
import { formatTime } from "@/lib/format";

const ACTIVITY_LINKS: Record<ActivityType, string> = {
  LISTING_CREATED: "/listings",
  INQUIRY: "/contacts",
  DEAL_CREATED: "/deals",
  DOCUMENT_ADDED: "/documents",
};

export function NotificationPopover({ activities }: { activities: ActivitySelect[] }) {
  const t = useTranslations("Dashboard");

  return (
    <Popover>
      <PopoverTrigger
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none"
        aria-label={t("notifications")}
        aria-haspopup="dialog"
      >
        <Bell className="h-4 w-4" />
        {activities.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-micro font-semibold text-primary-foreground ring-2 ring-background">
            {activities.length > 9 ? "9+" : activities.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{t("recentActivity")}</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <EmptyState className="p-8">{t("noNotifications")}</EmptyState>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={activityValue(a.type, ACTIVITY_LINKS) ?? "/dashboard"}
                  className="flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.description ?? a.type}
                    </p>
                    <p className="mono-caption text-micro mt-1">{formatTime(a.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
