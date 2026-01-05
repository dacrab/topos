"use client";

import { Building2, DollarSign, FileText, Home, UserPlus } from "lucide-react";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import type { ActivitySelect, ListingSelect } from "@/db/schema";

type ActivityItemProps = {
  activity: ActivitySelect;
  listing?: ListingSelect | null;
};

const TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LISTING_CREATED: Building2,
  NEW_LEAD: UserPlus,
  OFFER_RECEIVED: DollarSign,
  CONTACT_ADDED: UserPlus,
  DOCUMENT_ADDED: FileText,
};

function ActivityContent({ activity }: { activity: ActivitySelect }) {
  const Icon = TYPE_ICONS[activity.type] || Home;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group w-full">
      <div className="w-12 h-12 border border-border flex items-center justify-center bg-secondary/50 text-muted-foreground font-mono text-xs group-hover:border-foreground/50 group-hover:text-foreground transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-foreground truncate">
            {activity.title}
          </p>
          <span className="text-[10px] font-mono text-muted-foreground">
            {activity.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate font-mono">
          {activity.description || activity.type}
        </p>
      </div>
    </div>
  );
}

export function ActivityItem({ activity, listing }: ActivityItemProps) {
  if (listing && activity.type === "LISTING_CREATED") {
    return (
      <ListingDetailDialog
        listing={listing}
        trigger={
          <button
            type="button"
            className="w-full text-left cursor-pointer hover:bg-secondary/30"
          >
            <ActivityContent activity={activity} />
          </button>
        }
      />
    );
  }

  return <ActivityContent activity={activity} />;
}
