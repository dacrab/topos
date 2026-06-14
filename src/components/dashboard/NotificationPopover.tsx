"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
      <PopoverTrigger className="relative flex h-full w-16 items-center justify-center text-muted-foreground hover:bg-brand/30 hover:text-foreground focus-visible:outline-none">
        <Bell className="h-5 w-5" />
        {activities.length > 0 && (
          <Badge
            variant="default"
            className="absolute top-4 right-4 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
          >
            {activities.length > 9 ? "9+" : activities.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 border-2 border-foreground bg-background"
      >
        <div className="border-b-2 border-foreground p-4">
          <h3 className="label-caps text-foreground">{t("recentActivity")}</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <EmptyState>{t("noNotifications")}</EmptyState>
          ) : (
            <div className="divide-y divide-foreground">
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={ACTIVITY_LINKS[a.type] || "/dashboard"}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.description || a.type}
                    </p>
                    <p className="mono-caption text-[10px] mt-1">{formatTime(a.createdAt)}</p>
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
