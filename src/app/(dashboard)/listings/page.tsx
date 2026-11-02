import { and, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { Bath, Bed, Home, MapPin, Maximize } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { getAddress, getFeatures } from "@/components/listings/shared";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import type { ListingSelect } from "@/db/schema";
import { listing } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { LISTING_STATUS_LABELS, labelKey } from "@/lib/labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Listings");
  return { title: t("pageTitle") };
}

const PAGE_SIZE = 20;

const STATUS_VARIANTS = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "default",
} as const;

function ListingCard({
  item,
  t,
  locale,
}: {
  item: ListingSelect;
  t: (key: string) => string;
  locale: string;
}) {
  const features = getFeatures(item);
  const address = getAddress(item);
  const image = item.images?.[0];
  const location = [address.area, address.city].filter(Boolean).join(", ");
  const status = item.status as keyof typeof STATUS_VARIANTS;
  const facts = [
    features.beds != null && {
      icon: Bed,
      value: `${features.beds} ${t("bedsShort")}`,
    },
    features.baths != null && {
      icon: Bath,
      value: `${features.baths} ${t("bathsShort")}`,
    },
    features.sqft != null && {
      icon: Maximize,
      value: `${features.sqft} m²`,
    },
  ].filter(Boolean) as { icon: typeof Bed; value: string }[];

  return (
    <article className="group flex flex-col">
      <div className="media-frame">
        {image ? (
          <Image
            src={image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="texture-grid flex h-full items-center justify-center bg-muted/60 opacity-70">
            <Home className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 flex gap-2">
          <Badge variant={STATUS_VARIANTS[status] ?? "default"}>
            {t(labelKey(LISTING_STATUS_LABELS, item.status))}
          </Badge>
        </div>
        {features.listingType && (
          <span className="absolute right-2.5 top-2.5 border border-border bg-background/90 px-1.5 py-0.5 micro-caps text-foreground backdrop-blur">
            {features.listingType === "rent" ? t("forRent") : t("forSale")}
          </span>
        )}
        {item.images && item.images.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 bg-foreground/75 px-1.5 py-0.5 font-mono text-[0.5625rem] text-background backdrop-blur">
            {String(item.images.length).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            {item.title}
          </h2>
          <span className="shrink-0 font-display text-lg leading-none text-foreground tabular-nums">
            {formatCurrency(item.price, false, locale)}
          </span>
        </div>

        <p className="flex items-center gap-1.5 meta-caps text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location || t("noAddress")}</span>
        </p>

        {facts.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2.5 text-xs text-muted-foreground">
            {facts.map(({ icon: Icon, value }) => (
              <span key={value} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-accent" />
                {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
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
  const locale = await getLocale();
  const { tenantId, tenant } = await requireTenant();
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
    <div className="space-y-6">
      <SectionHeader
        title={t("pageTitle")}
        description={t("manageProperties", { tenantName: tenant.name })}
      >
        <NewListingDialog />
      </SectionHeader>

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
              { value: "ARCHIVED", label: t("archived") },
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
        <EmptyState icon={<Home className="h-5 w-5" />}>
          <span className="block font-medium text-foreground">{t("noListingsYet")}</span>{" "}
          {t("noListingsDesc")}
        </EmptyState>
      ) : (
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((item) => (
            <ListingDetailDialog
              key={item.id}
              listing={item}
              trigger={
                <button type="button" className="block w-full text-left">
                  <ListingCard item={item} t={t} locale={locale} />
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
