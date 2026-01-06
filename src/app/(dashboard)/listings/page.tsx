import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ListingDetailDialog } from "@/components/listings/ListingDetailDialog";
import { NewListingDialog } from "@/components/listings/NewListingDialog";
import { SectionHeader } from "@/components/ui";
import { listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { parseListingData } from "@/lib/types";

export const dynamic = "force-dynamic";

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
          className="border-b-0 pb-0"
        />
        <NewListingDialog />
      </div>

      {listings.length === 0 ? (
        <div className="border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          {t("noListingsYet")} {t("noListingsDesc")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => {
            const { features } = parseListingData(item);
            return (
              <ListingDetailDialog
                key={item.id}
                listing={item}
                trigger={
                  <button
                    type="button"
                    className="border border-border/60 bg-card p-6 space-y-4 hover:shadow-md hover:border-primary/50 transition-all group text-left w-full cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg text-foreground line-clamp-1">
                        {item.title}
                      </h2>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-muted text-foreground border border-border/40">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2 font-light leading-relaxed">
                      {item.description}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border/40">
                      <span className="font-mono font-bold text-lg text-foreground">
                        €{item.price.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {features.beds ?? "-"} beds • {features.baths ?? "-"} baths
                      </span>
                    </div>
                  </button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
