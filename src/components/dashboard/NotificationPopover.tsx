"use client";

import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { dismissActivity, dismissAllActivities } from "@/app/(dashboard)/actions";
import { EmptyState } from "@/components/ui/page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActivitySelect } from "@/db/schema";
import { formatTime } from "@/lib/format";

function getActivityLink(type: string): string {
  if (type === "LISTING_CREATED") return "/listings";
  if (type === "NEW_LEAD" || type === "CONTACT_ADDED") return "/contacts";
  return "/dashboard";
}

export function NotificationPopover({ activities: initial }: { activities: ActivitySelect[] }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [activities, setActivities] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleDismiss(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActivities((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      await dismissActivity(id);
      router.refresh();
    });
  }

  function handleDismissAll() {
    setActivities([]);
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
          {activities.length > 0 && (
            <span className="absolute top-4 right-4 h-5 w-5 bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
              {activities.length > 9 ? "9+" : activities.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 border-border bg-background">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h3 className="label-caps text-foreground">{t("recentActivity")}</h3>
          {activities.length > 0 && (
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
          {activities.length === 0 ? (
            <EmptyState className="p-8 text-sm">{t("noNotifications")}</EmptyState>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={getActivityLink(a.type)}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.description || a.type}
                    </p>
                    <p className="mono-caption text-[10px] mt-1">{formatTime(a.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("dismissNotification")}
                    onClick={(e) => handleDismiss(a.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X size={14} />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
