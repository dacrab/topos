import { and, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { getFeatures } from "@/components/listings/shared";
import { Pagination } from "@/components/pagination";
import { ArchTopBar } from "@/components/ui/arch-top";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import type { ListingSelect } from "@/db/schema";
import { listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Listings");
  return { title: t("pageTitle") };
}

const PAGE_SIZE = 20;

function ListingCard({ item, t }: { item: ListingSelect; t: (key: string) => string }) {
  const features = getFeatures(item);

  return (
    <div className="border border-border/40 bg-card shadow-card group cursor-pointer rounded-2xl overflow-hidden hover:border-primary/30 card-hover hover:shadow-card-hover transition-all">
      <ArchTopBar className="h-2" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-lg text-foreground line-clamp-1">{item.title}</h2>
          <Badge variant={item.status === "PUBLISHED" ? "success" : "default"} className="shrink-0">
            {t(item.status === "PUBLISHED" ? "published" : "draft")}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {item.description}
        </div>
        <div className="flex items-center justify-between text-sm pt-4 border-t border-border/40">
          <span className="font-semibold text-lg text-foreground tabular-nums">
            {formatCurrency(item.price)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {features.beds ?? "-"} {t("bedsShort")} &middot; {features.baths ?? "-"}{" "}
            {t("bathsShort")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}) {
  const t = await getTranslations("Listings");
  const { tenantId, tenant } = await requireDashboardAuth();
  const { q, status, type, minPrice, maxPrice, page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const conditions = [eq(listing.tenantId, tenantId)];
  if (q) conditions.push(ilike(listing.title, `%${q}%`));
  if (status) conditions.push(eq(listing.status, status));
  if (type) conditions.push(sql`${listing.features}->>'listingType' = ${type}`);
  if (minPrice) conditions.push(gte(listing.price, Number(minPrice)));
  if (maxPrice) conditions.push(lte(listing.price, Number(maxPrice)));

  const [listings, [totalRow]] = await Promise.all([
    db
      .select()
      .from(listing)
      .where(and(...conditions))
      .orderBy(desc(listing.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: count() })
      .from(listing)
      .where(and(...conditions)),
  ]);

  const totalPages = Math.ceil((totalRow?.count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={t("pageTitle")}
          description={t("manageProperties", { tenantName: tenant.name })}
        />
        <NewListingDialog />
      </div>

      <SearchFilters
        filters={[
          { name: "q", type: "text", placeholder: t("searchPlaceholder") },
          {
            name: "status",
            type: "select",
            options: [
              { value: "", label: t("allStatuses") },
              { value: "DRAFT", label: t("draft") },
              { value: "PUBLISHED", label: t("published") },
            ],
          },
          {
            name: "type",
            type: "select",
            options: [
              { value: "", label: t("allTypes") },
              { value: "sale", label: t("sale") },
              { value: "rent", label: t("rent") },
            ],
          },
          { name: "minPrice", type: "number", placeholder: t("minPrice") },
          { name: "maxPrice", type: "number", placeholder: t("maxPrice") },
        ]}
      />

      {listings.length === 0 ? (
        <EmptyState>
          {t("noListingsYet")} {t("noListingsDesc")}
        </EmptyState>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <ListingDetailDialog
              key={item.id}
              listing={item}
              trigger={
                <button type="button" className="block w-full">
                  <ListingCard item={item} t={t} />
                </button>
              }
            />
          ))}
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/listings" />
    </div>
  );
}
