"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArchTopBar } from "@/components/ui/arch-top";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActivitySelect } from "@/db/schema";
import { formatTime } from "@/lib/format";

const ACTIVITY_LINKS: Record<string, string> = {
  LISTING_CREATED: "/listings",
  NEW_LEAD: "/contacts",
  CONTACT_ADDED: "/contacts",
};

export function NotificationPopover({ activities }: { activities: ActivitySelect[] }) {
  const t = useTranslations("Dashboard");

  return (
    <Popover>
      <PopoverTrigger
        className="relative flex h-16 w-14 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none"
        aria-label={t("notifications")}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" />
        {activities.length > 0 && (
          <Badge
            variant="primary"
            className="absolute top-4 right-3 h-4 min-w-4 px-1 flex items-center justify-center text-micro animate-pulse-badge"
          >
            {activities.length > 9 ? "9+" : activities.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 border border-border/40 shadow-elevated bg-background overflow-hidden"
      >
        <ArchTopBar opacity="5" />
        <div className="border-b border-border/30 px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{t("recentActivity")}</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <EmptyState>{t("noNotifications")}</EmptyState>
          ) : (
            <div className="divide-y divide-border/30">
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={ACTIVITY_LINKS[a.type] || "/dashboard"}
                  className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors"
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
