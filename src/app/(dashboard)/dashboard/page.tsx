import { and, count, desc, eq, sql } from "drizzle-orm";
import type { LucideIcon } from "lucide-react";
import { Building2, DollarSign, FileText, Home, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { EmptyState } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat";
import type { ActivitySelect, ListingSelect } from "@/db/schema";
import { activity, contact, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Dashboard" };

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  LISTING_CREATED: Building2,
  NEW_LEAD: UserPlus,
  OFFER_RECEIVED: DollarSign,
  CONTACT_ADDED: UserPlus,
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
  const Icon = ACTIVITY_ICONS[activity.type] ?? Home;
  const content = (
    <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group">
      <div className="w-10 h-10 border border-border flex items-center justify-center bg-secondary/50 text-muted-foreground group-hover:border-foreground/50 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
          <span className="mono-caption">{formatTime(activity.createdAt)}</span>
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
          <button type="button" className="block w-full">
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
  const { tenantId } = await requireDashboardAuth();
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
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">{t("title")}</h1>
          <div className="flex items-center gap-2 mono-caption uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t("systemOperational")} • {formatDate(new Date())}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
        <StatCard title={t("activeListings")} value={stats.activeListings} />
        <StatCard title={t("contacts")} value={stats.totalContacts} />
        <StatCard
          title={t("revenue")}
          value={formatCurrency(stats.totalRevenue)}
          subtitle={t("totalListingValue")}
        />
      </div>

      <div>
        <h2 className="label-caps mb-4">{t("recentActivity")}</h2>
        {activities.length === 0 ? (
          <EmptyState>{t("noRecentActivity")}</EmptyState>
        ) : (
          <div className="border border-border divide-y divide-border">
            {activities.map((a) => (
              <ActivityItem key={a.id} activity={a} listing={a.listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
