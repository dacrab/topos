import { count, desc, eq, sql } from "drizzle-orm";
import type { LucideIcon } from "lucide-react";
import { Activity, Building2, FileText, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { EmptyState } from "@/components/ui/page";
import { QuickStat, StatCard } from "@/components/ui/stat";
import type { ActivitySelect, ListingSelect } from "@/db/schema";
import { activity, contact, listing, transactionPipeline } from "@/db/schema";
import { getActivityIcon } from "@/lib/activity";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { formatCurrency, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type DashboardStats = {
  activeListings: number;
  totalContacts: number;
  pendingDeals: number;
  totalRevenue: number;
};

async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
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

function DashboardHero({ title, statusLabel }: { title: string; statusLabel: string }) {
  return (
    <div className="flex items-end justify-between border-b border-border pb-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">{title}</h1>
        <div className="flex items-center gap-2 mono-caption uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {statusLabel} • {new Date().toLocaleDateString()}
        </div>
      </div>
      <NewListingDialog />
    </div>
  );
}

function DashboardStatsGrid({
  tenantName,
  stats,
  activeListingsLabel,
  pendingDealsLabel,
  contactsLabel,
  revenueLabel,
  revenueSubtitle,
}: {
  tenantName: string;
  stats: DashboardStats;
  activeListingsLabel: string;
  pendingDealsLabel: string;
  contactsLabel: string;
  revenueLabel: string;
  revenueSubtitle: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
      <StatCard
        title={activeListingsLabel}
        value={stats.activeListings.toString().padStart(2, "0")}
        subtitle={tenantName}
        icon={Building2}
      />
      <StatCard
        title={pendingDealsLabel}
        value={stats.pendingDeals.toString().padStart(2, "0")}
        subtitle={`${stats.totalContacts} ${contactsLabel}`}
        icon={FileText}
      />
      <StatCard
        title={revenueLabel}
        value={formatCurrency(stats.totalRevenue)}
        subtitle={revenueSubtitle}
        icon={TrendingUp}
      />
    </div>
  );
}

function DashboardSection({
  title,
  icon: Icon,
  aside,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </h3>
        {aside && <span className="mono-caption text-[10px]">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function RecentActivityPanel({
  title,
  aside,
  activities,
  emptyLabel,
}: {
  title: string;
  aside: string;
  activities: Array<ActivitySelect & { listing?: ListingSelect | null }>;
  emptyLabel: string;
}) {
  return (
    <DashboardSection title={title} icon={Activity} aside={aside}>
      <div className="border border-border bg-background divide-y divide-border">
        {activities.length === 0 ? (
          <EmptyState className="p-8 text-sm">{emptyLabel}</EmptyState>
        ) : (
          activities.map((item) => (
            <ActivityItem
              key={item.id}
              activity={item}
              {...(item.listing !== undefined ? { listing: item.listing } : {})}
            />
          ))
        )}
      </div>
    </DashboardSection>
  );
}

function QuickStatsPanel({
  title,
  listingsLabel,
  inquiriesLabel,
  dealsLabel,
  stats,
}: {
  title: string;
  listingsLabel: string;
  inquiriesLabel: string;
  dealsLabel: string;
  stats: DashboardStats;
}) {
  return (
    <DashboardSection title={title}>
      <div className="border border-border bg-background">
        <QuickStat label={listingsLabel} value={stats.activeListings} />
        <QuickStat label={inquiriesLabel} value={stats.totalContacts} />
        <QuickStat label={dealsLabel} value={stats.pendingDeals} />
      </div>
    </DashboardSection>
  );
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
      <DashboardHero title={t("title")} statusLabel={t("systemOperational")} />

      <DashboardStatsGrid
        tenantName={tenant.name}
        stats={stats}
        activeListingsLabel={t("activeListings")}
        pendingDealsLabel={t("pendingDeals")}
        contactsLabel={t("contacts")}
        revenueLabel={t("revenue")}
        revenueSubtitle={t("totalListingValue")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <RecentActivityPanel
            title={t("recentActivity")}
            aside={t("liveFeed")}
            activities={activities}
            emptyLabel={t("noRecentActivity")}
          />
        </div>

        <QuickStatsPanel
          title={t("quickStats")}
          listingsLabel={t("activeListings")}
          inquiriesLabel={t("inquiries")}
          dealsLabel={t("pendingDeals")}
          stats={stats}
        />
      </div>
    </div>
  );
}
