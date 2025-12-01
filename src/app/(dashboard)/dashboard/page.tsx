import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { Activity, Building2, FileText, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ActivityItem } from "@/components/ActivityItem";
import { NewListingDialog } from "@/components/NewListingDialog";
import { activity, contact, listing, transactionPipeline } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { createListing } from "../actions";

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

type ActivityMetadata = {
  listingId?: string;
  [key: string]: unknown;
};

async function getRecentActivities(tenantId: string) {
  const activities = await db
    .select()
    .from(activity)
    .where(eq(activity.tenantId, tenantId))
    .orderBy(desc(activity.createdAt))
    .limit(5);

  // Get listing IDs from activities that reference them
  const listingIds = activities
    .map((a) => (a.metadata as ActivityMetadata)?.listingId)
    .filter((id): id is string => !!id);

  // Fetch related listings if any
  const relatedListings =
    listingIds.length > 0
      ? await db.select().from(listing).where(inArray(listing.id, listingIds))
      : [];

  // Create a map of listings by ID
  const listingsMap = new Map(relatedListings.map((l) => [l.id, l]));

  return { activities, listingsMap };
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const tenant = await getCurrentTenant();
  const [stats, { activities, listingsMap }] = await Promise.all([
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
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            System Operational • {new Date().toLocaleDateString()}
          </div>
        </div>
        <NewListingDialog createListing={createListing} />
      </div>

      {/* Data Grid - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
        {/* Metric 1 */}
        <div className="p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative">
          <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
            <Building2 className="w-12 h-12" />
          </div>
          <div className="flex flex-col h-full justify-between space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("activeListings")}
            </h3>
            <div>
              <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
                {stats.activeListings.toString().padStart(2, "0")}
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs font-mono">
                {tenant.name}
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative">
          <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
            <FileText className="w-12 h-12" />
          </div>
          <div className="flex flex-col h-full justify-between space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("pendingDeals")}
            </h3>
            <div>
              <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
                {stats.pendingDeals.toString().padStart(2, "0")}
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs font-mono">
                {stats.totalContacts} contacts
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative">
          <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
            <TrendingUp className="w-12 h-12" />
          </div>
          <div className="flex flex-col h-full justify-between space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t("revenue")}
            </h3>
            <div>
              <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
                €
                {stats.totalRevenue >= 1000000
                  ? `${(stats.totalRevenue / 1000000).toFixed(1)}M`
                  : stats.totalRevenue >= 1000
                    ? `${(stats.totalRevenue / 1000).toFixed(0)}k`
                    : stats.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs font-mono">
                Total listing value
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Activity Stream - Terminal Style */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t("recentActivity")}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">
              LIVE FEED
            </span>
          </div>

          <div className="border border-border bg-background divide-y divide-border">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No recent activity
              </div>
            ) : (
              activities.map((item) => {
                const metadata = item.metadata as ActivityMetadata | null;
                const relatedListing = metadata?.listingId
                  ? listingsMap.get(metadata.listingId)
                  : undefined;
                return (
                  <ActivityItem
                    key={item.id}
                    activity={item}
                    listing={relatedListing}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Quick Stats - Data List */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground">
              {t("quickStats")}
            </h3>
          </div>

          <div className="border border-border bg-background">
            <div className="p-6 border-b border-border hover:bg-secondary/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t("activeListings")}
              </div>
              <div className="text-3xl font-mono font-bold">
                {stats.activeListings}
              </div>
            </div>
            <div className="p-6 border-b border-border hover:bg-secondary/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t("inquiries")}
              </div>
              <div className="text-3xl font-mono font-bold">
                {stats.totalContacts}
              </div>
            </div>
            <div className="p-6 hover:bg-secondary/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                {t("pendingDeals")}
              </div>
              <div className="text-3xl font-mono font-bold">
                {stats.pendingDeals}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
