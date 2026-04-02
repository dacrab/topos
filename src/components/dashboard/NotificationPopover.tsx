"use client";

import { Bell, Building2, DollarSign, FileText, Home, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { dismissActivity, dismissAllActivities } from "@/app/(dashboard)/actions";
import { EmptyState } from "@/components/ui/page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActivitySelect } from "@/db/schema";
import { formatTime } from "@/lib/format";

type ActivityIcon = typeof Bell;

const ACTIVITY_CONFIG: Record<string, { icon: ActivityIcon; link: string }> = {
  LISTING_CREATED: { icon: Building2, link: "/listings" },
  NEW_LEAD: { icon: UserPlus, link: "/contacts" },
  OFFER_RECEIVED: { icon: DollarSign, link: "/transactions" },
  CONTACT_ADDED: { icon: UserPlus, link: "/contacts" },
  DOCUMENT_ADDED: { icon: FileText, link: "/dashboard" },
};

function getActivityIcon(type: string): ActivityIcon {
  return ACTIVITY_CONFIG[type]?.icon ?? Home;
}
function getActivityLink(type: string): string {
  return ACTIVITY_CONFIG[type]?.link ?? "/dashboard";
}

type NotificationPopoverProps = {
  activities: ActivitySelect[];
};

export function NotificationPopover({ activities }: NotificationPopoverProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [localActivities, setLocalActivities] = useState(activities);
  const [isPending, startTransition] = useTransition();

  const unreadCount = localActivities.length;

  function handleDismiss(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLocalActivities((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      await dismissActivity(id);
      router.refresh();
    });
  }

  function handleDismissAll() {
    setLocalActivities([]);
    startTransition(async () => {
      await dismissAllActivities();
      router.refresh();
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-full w-16 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-4 right-4 h-5 w-5 bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 border-border bg-background">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h3 className="label-caps text-foreground">{t("recentActivity")}</h3>
          {localActivities.length > 0 && (
            <button
              type="button"
              onClick={handleDismissAll}
              disabled={isPending}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X size={12} />
              {t("clearAll")}
            </button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {localActivities.length === 0 ? (
            <EmptyState className="p-8 text-sm">{t("noNotifications")}</EmptyState>
          ) : (
            <div className="divide-y divide-border">
              {localActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const href = getActivityLink(activity.type);
                return (
                  <Link
                    key={activity.id}
                    href={href}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-8 h-8 border border-border flex items-center justify-center bg-secondary/50 flex-shrink-0">
                      <Icon size={14} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description || activity.type}
                      </p>
                      <p className="mono-caption text-[10px] mt-1">
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={t("dismissNotification")}
                      onClick={(e) => handleDismiss(activity.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <X size={14} />
                    </button>
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
