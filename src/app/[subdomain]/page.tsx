import { and, desc, eq } from "drizzle-orm";
import { Bath, Bed, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { type ListingSelect, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenantOrNotFound } from "@/lib/getTenant";
import { parseListingData } from "@/lib/listing";

export default async function SiteHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const tenant = await getTenantOrNotFound(subdomain);
  const t = await getTranslations("Tenant");

  const listings: ListingSelect[] = await db
    .select()
    .from(listing)
    .where(and(eq(listing.tenantId, tenant.id), eq(listing.status, "PUBLISHED")))
    .orderBy(desc(listing.createdAt))
    .limit(9)
    .catch(() => []);

  return (
    <div>
      <section className="py-32 border-b border-border">
        <div className="container mx-auto px-8 max-w-screen-xl text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">{tenant.name}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("footerDesc")}</p>
          <Link
            href="#listings"
            className="inline-flex items-center bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            {t("viewCollection")}
          </Link>
        </div>
      </section>

      <section id="listings" className="container mx-auto px-8 max-w-screen-xl py-20">
        <h2 className="text-2xl font-bold tracking-tight mb-12">{t("featuredProperties")}</h2>

        {listings.length === 0 ? (
          <div className="border border-dashed border-border/60 py-20 text-center text-muted-foreground">
            <p>{t("noProperties")}</p>
            <p className="text-sm mt-2">{t("checkBackSoon")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((item) => {
              const { features, address } = parseListingData(item);
              return (
                <Link href={`/listing/${item.id}`} key={item.id} className="group block">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden border border-border mb-4">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                        {t("noImage")}
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 text-sm font-bold">
                      €{item.price.toLocaleString()}
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h3>
                  {address.city && (
                    <div className="flex items-center text-muted-foreground text-xs mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {address.city}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {features.beds ?? 0} {t("beds")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {features.baths ?? 0} {t("baths")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
