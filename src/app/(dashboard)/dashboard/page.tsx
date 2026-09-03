import { and, count, desc, eq, sql } from "drizzle-orm";
import { Building2, DollarSign, FileText, Home, type LucideIcon, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat";
import type { ActivitySelect, ListingSelect } from "@/db/schema";
import { activity, contact, listing } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import type { ActivityType } from "@/lib/activity";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("title") };
}

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  LISTING_CREATED: Building2,
  INQUIRY: UserPlus,
  DEAL_CREATED: DollarSign,
  DOCUMENT_ADDED: FileText,
};

type DashboardStats = {
  activeListings: number;
  totalContacts: number;
  totalRevenue: number;
};

async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const [listingsResult, contactsResult, revenueResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(listing)
      .where(and(eq(listing.tenantId, tenantId), eq(listing.status, "PUBLISHED"))),
    db.select({ count: count() }).from(contact).where(eq(contact.tenantId, tenantId)),
    db
      .select({ total: sql<number>`COALESCE(SUM(price), 0)` })
      .from(listing)
      .where(eq(listing.tenantId, tenantId)),
  ]);
  return {
    activeListings: listingsResult[0]?.count ?? 0,
    totalContacts: contactsResult[0]?.count ?? 0,
    totalRevenue: revenueResult[0]?.total ?? 0,
  };
}

function ActivityItem({
  activity,
  listing,
}: {
  activity: ActivitySelect;
  listing?: ListingSelect | null;
}) {
  const Icon = ACTIVITY_ICONS[activity.type as ActivityType] ?? Home;
  const content = (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group">
      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
          <span className="text-xs text-muted-foreground shrink-0 ml-4 tabular-nums">
            {formatTime(activity.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {activity.description || activity.type}
        </p>
      </div>
    </div>
  );

  if (listing && activity.type === "LISTING_CREATED") {
    return (
      <ListingDetailDialog
        listing={listing}
        trigger={
          <button type="button" className="block w-full text-left">
            {content}
          </button>
        }
      />
    );
  }
  return content;
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const { tenantId } = await requireTenant();
  const [stats, activities] = await Promise.all([
    getDashboardStats(tenantId),
    db.query.activity.findMany({
      where: eq(activity.tenantId, tenantId),
      orderBy: [desc(activity.createdAt)],
      limit: 5,
      with: { listing: true, contact: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title mb-1.5">{t("title")}</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          {t("systemOperational")} &middot; {formatDate(new Date())}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title={t("activeListings")} value={stats.activeListings} />
        <StatCard title={t("contacts")} value={stats.totalContacts} />
        <StatCard
          title={t("revenue")}
          value={formatCurrency(stats.totalRevenue)}
          subtitle={t("totalListingValue")}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="label-caps">{t("recentActivity")}</h2>
          {activities.length > 0 && (
            <Badge variant="primary" className="px-1.5 py-0">
              {activities.length}
            </Badge>
          )}
        </div>
        {activities.length === 0 ? (
          <EmptyState>{t("noRecentActivity")}</EmptyState>
        ) : (
          <div className="card-base overflow-hidden">
            <div className="divide-y divide-border">
              {activities.map((a) => (
                <ActivityItem key={a.id} activity={a} listing={a.listing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
