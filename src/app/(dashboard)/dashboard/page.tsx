import { count, desc, eq, sql } from "drizzle-orm";
import { Activity, Building2, FileText, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { QuickStat, StatCard } from "@/components/ui";
import type { ActivitySelect, ListingSelect } from "@/db/schema";
import { activity, contact, listing, transactionPipeline } from "@/db/schema";
import { getActivityIcon } from "@/lib/activity";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { formatCurrency, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getDashboardStats(tenantId: string) {
  const [listingsResult, contactsResult, pipelinesResult, revenueResult] = await Promise.all([
    db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenantId)),
    db.select({ count: count() }).from(contact).where(eq(contact.tenantId, tenantId)),
    db
      .select({ count: count() })
      .from(transactionPipeline)
      .where(eq(transactionPipeline.tenantId, tenantId)),
    db
      .select({ total: sql<number>`COALESCE(SUM(price), 0)` })
      .from(listing)
      .where(eq(listing.tenantId, tenantId)),
  ]);

  return {
    activeListings: listingsResult[0]?.count ?? 0,
    totalContacts: contactsResult[0]?.count ?? 0,
    pendingDeals: pipelinesResult[0]?.count ?? 0,
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
  const Icon = getActivityIcon(activity.type);
  const content = (
    <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group w-full">
      <div className="w-12 h-12 border border-border flex items-center justify-center bg-secondary/50 text-muted-foreground font-mono text-xs group-hover:border-foreground/50 group-hover:text-foreground transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-foreground truncate">{activity.title}</p>
          <span className="mono-caption text-[10px]">{formatTime(activity.createdAt)}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate font-mono">
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
          <button type="button" className="w-full text-left cursor-pointer hover:bg-secondary/30">
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
  const tenant = await getCurrentTenant();
  const [stats, activities] = await Promise.all([
    getDashboardStats(tenant.id),
    db.query.activity.findMany({
      where: eq(activity.tenantId, tenant.id),
      orderBy: desc(activity.createdAt),
      limit: 5,
      with: { listing: true, contact: true },
    }),
  ]);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">{t("title")}</h1>
          <div className="flex items-center gap-2 mono-caption uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t("systemOperational")} • {new Date().toLocaleDateString()}
          </div>
        </div>
        <NewListingDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
        <StatCard
          title={t("activeListings")}
          value={stats.activeListings.toString().padStart(2, "0")}
          subtitle={tenant.name}
          icon={Building2}
        />
        <StatCard
          title={t("pendingDeals")}
          value={stats.pendingDeals.toString().padStart(2, "0")}
          subtitle={`${stats.totalContacts} ${t("contacts")}`}
          icon={FileText}
        />
        <StatCard
          title={t("revenue")}
          value={formatCurrency(stats.totalRevenue)}
          subtitle={t("totalListingValue")}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t("recentActivity")}
            </h3>
            <span className="mono-caption text-[10px]">{t("liveFeed")}</span>
          </div>
          <div className="border border-border bg-background divide-y divide-border">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {t("noRecentActivity")}
              </div>
            ) : (
              activities.map((item) => (
                <ActivityItem key={item.id} activity={item} listing={item.listing} />
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground">
              {t("quickStats")}
            </h3>
          </div>
          <div className="border border-border bg-background">
            <QuickStat label={t("activeListings")} value={stats.activeListings} />
            <QuickStat label={t("inquiries")} value={stats.totalContacts} />
            <QuickStat label={t("pendingDeals")} value={stats.pendingDeals} />
          </div>
        </div>
      </div>
    </div>
  );
}
