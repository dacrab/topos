import { and, count, desc, eq, sql } from "drizzle-orm";
import { Building2, DollarSign, Home, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ACTIVITY_ICONS } from "@/components/dashboard/activity-icons";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { EmptyState } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat";
import type { ActivitySelect, ListingSelect } from "@/db/schema";
import { activity, contact, listing } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { activityValue } from "@/lib/activity";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { ACTIVITY_TYPE_LABELS, labelKey } from "@/lib/labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("title") };
}

type DashboardStats = {
  activeListings: number;
  totalContacts: number;
  portfolioValue: number;
};

async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const [listingsResult, contactsResult, valueResult] = await Promise.all([
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
    portfolioValue: valueResult[0]?.total ?? 0,
  };
}

function ActivityItem({
  entry,
  listingItem,
  fallbackLabel,
  index,
  locale,
}: {
  entry: ActivitySelect;
  listingItem?: ListingSelect | null;
  fallbackLabel: string;
  index: number;
  locale: string;
}) {
  const Icon = activityValue(entry.type, ACTIVITY_ICONS) ?? Home;
  const content = (
    <div className="group grid grid-cols-[1.75rem_2rem_1fr] items-start gap-x-3 gap-y-1 border-b border-border py-4 text-left transition-colors hover:bg-muted/40 sm:grid-cols-[2rem_2.25rem_1fr_5rem] sm:items-center sm:gap-x-4">
      <span className="font-mono text-micro tracking-caps text-muted-foreground/60 tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex h-7 w-7 items-center justify-center border border-border text-accent transition-colors group-hover:border-foreground/40 sm:h-8 sm:w-8">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{entry.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {entry.description || fallbackLabel}
        </p>
      </div>
      <span className="col-start-3 font-mono text-micro tabular-nums text-muted-foreground sm:col-start-auto sm:text-right">
        {formatTime(entry.createdAt, locale)}
      </span>
    </div>
  );

  if (listingItem && entry.type === "LISTING_CREATED") {
    return (
      <ListingDetailDialog
        listing={listingItem}
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
  const locale = await getLocale();
  const { tenantId, tenant } = await requireTenant();
  const [stats, activities] = await Promise.all([
    getDashboardStats(tenantId),
    db.query.activity.findMany({
      where: eq(activity.tenantId, tenantId),
      orderBy: [desc(activity.createdAt)],
      limit: 6,
      with: { listing: true, contact: true },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header className="grid gap-6 border-b-2 border-foreground/85 pb-6 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-8 lg:pr-8">
          <p className="chip-eyebrow mb-4">{tenant.name}</p>
          <h1 className="page-title">{t("title")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-border pt-4 lg:col-span-4 lg:justify-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <span className="meta-caps text-muted-foreground">{formatDate(new Date(), locale)}</span>
          <span className="index-caps">{String(activities.length).padStart(2, "0")} / 06</span>
        </div>
      </header>

      <div className="grid gap-px border-y border-border bg-border md:grid-cols-3">
        <StatCard title={t("activeListings")} value={stats.activeListings} icon={Building2} />
        <StatCard title={t("contacts")} value={stats.totalContacts} icon={UserPlus} />
        <StatCard
          title={t("portfolioValue")}
          value={formatCurrency(stats.portfolioValue, false, locale)}
          subtitle={t("portfolioValueHint")}
          icon={DollarSign}
        />
      </div>

      <section>
        <div className="mb-1 flex items-end justify-between border-b-2 border-foreground/85 pb-3">
          <h2 className="font-display text-xl tracking-[-0.01em]">{t("recentActivity")}</h2>
          <span className="meta-caps text-muted-foreground">
            {t("entryCount", { count: activities.length })}
          </span>
        </div>

        {activities.length === 0 ? (
          <EmptyState className="mt-6">{t("noRecentActivity")}</EmptyState>
        ) : (
          <div>
            {activities.map((entry, i) => (
              <ActivityItem
                key={entry.id}
                entry={entry}
                listingItem={entry.listing}
                fallbackLabel={t(labelKey(ACTIVITY_TYPE_LABELS, entry.type))}
                index={i}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
