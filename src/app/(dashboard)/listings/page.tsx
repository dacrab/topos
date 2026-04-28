import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import type { ListingSelect } from "@/db/schema";
import { listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import type { ListingFeatures } from "@/lib/types";

function ListingCard({ item, t }: { item: ListingSelect; t: (key: string) => string }) {
  const features = (item.features ?? {}) as ListingFeatures;

  return (
    <div className="border border-border bg-card p-6 space-y-4 hover:border-foreground/30 transition-colors group cursor-pointer">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground line-clamp-1">{item.title}</h2>
        <Badge>{t(item.status === "PUBLISHED" ? "published" : "draft")}</Badge>
      </div>
      <div className="text-sm text-muted-foreground line-clamp-2 font-light leading-relaxed">
        {item.description}
      </div>
      <div className="flex items-center justify-between text-sm pt-4 border-t border-border/40">
        <span className="font-mono font-bold text-lg text-foreground">
          {formatPrice(item.price)}
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {features.beds ?? "-"} beds • {features.baths ?? "-"} baths
        </span>
      </div>
    </div>
  );
}

export default async function ListingsPage() {
  const t = await getTranslations("Listings");
  const tenant = await getCurrentTenant();

  const listings = await db
    .select()
    .from(listing)
    .where(eq(listing.tenantId, tenant.id))
    .orderBy(desc(listing.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={t("pageTitle")}
          description={t("manageProperties", { tenantName: tenant.name })}
        />
        <NewListingDialog />
      </div>

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
    </div>
  );
}
