"use client";

import { useEffect, useState, useTransition } from "react";
import { getEntityActivity } from "./activityFeedAction";

type Activity = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: unknown;
  createdAt: Date;
};

const ACTION_ICONS: Record<string, string> = {
  CREATE: "➕",
  UPDATE: "✏️",
  DELETE: "🗑️",
  NOTE: "📝",
};

export function ActivityFeed({
  entityType,
  entityId,
}: {
  entityType: "listing" | "contact" | "deal";
  entityId: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getEntityActivity(entityType, entityId);
      setActivities(data);
    });
  }, [entityType, entityId]);

  if (isPending && activities.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading activity…</p>;
  }

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2 text-sm">
          <span>{ACTION_ICONS[entry.action] ?? "📋"}</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium">{entry.action}</span>
            {entry.action === "NOTE" && (
              <p className="text-muted-foreground text-xs mt-0.5">
                {(entry.changes as { content?: string })?.content}
              </p>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(entry.createdAt).toLocaleDateString()}
          </time>
        </div>
      ))}
    </div>
  );
}
