import { count, desc, eq, sql } from "drizzle-orm";
import { Activity, Building2, FileText, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { QuickStat, StatCard } from "@/components/ui";
import { activity, contact, listing, transactionPipeline } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getDashboardStats(tenantId: string) {
  const [listingsResult, contactsResult, pipelinesResult, revenueResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(listing)
        .where(eq(listing.tenantId, tenantId)),
      db
        .select({ count: count() })
        .from(contact)
        .where(eq(contact.tenantId, tenantId)),
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

async function getRecentActivities(tenantId: string) {
  return db.query.activity.findMany({
    where: eq(activity.tenantId, tenantId),
    orderBy: desc(activity.createdAt),
    limit: 5,
    with: { listing: true, contact: true },
  });
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const tenant = await getCurrentTenant();
  const [stats, activities] = await Promise.all([
    getDashboardStats(tenant.id),
    getRecentActivities(tenant.id),
  ]);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">
            {t("title")}
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
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
            <span className="text-[10px] font-mono text-muted-foreground">
              {t("liveFeed")}
            </span>
          </div>
          <div className="border border-border bg-background divide-y divide-border">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {t("noRecentActivity")}
              </div>
            ) : (
              activities.map((item) => (
                <ActivityItem
                  key={item.id}
                  activity={item}
                  listing={item.listing}
                />
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
            <QuickStat
              label={t("activeListings")}
              value={stats.activeListings}
            />
            <QuickStat label={t("inquiries")} value={stats.totalContacts} />
            <QuickStat label={t("pendingDeals")} value={stats.pendingDeals} />
          </div>
        </div>
      </div>
    </div>
  );
}
