import { and, desc, eq } from "drizzle-orm";
import { ArrowRight, Bath, Bed, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { type ListingSelect, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { getTenantOrNotFound } from "@/lib/getTenant";
import { parseListingData } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--primary),_transparent_50%)] opacity-[0.03]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--accent),_transparent_50%)] opacity-[0.05]" />
          <div className="absolute inset-0 grid-pattern-sm opacity-[0.05]" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.3em] text-primary uppercase border border-primary/20 bg-primary/5">
            {t("exclusiveRealEstate")}
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none">
            {tenant.name}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {t("footerDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link
              href="#listings"
              className="bg-primary text-primary-foreground px-10 py-4 font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              {t("viewCollection")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="bg-background text-foreground border border-input px-10 py-4 font-bold text-sm uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center"
            >
              {t("contactUs")}
            </Link>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="container mx-auto px-8 max-w-screen-2xl py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-border/60 pb-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
              {t("featuredProperties")}
            </h2>
            <p className="text-muted-foreground text-lg font-light">{t("featuredSubtitle")}</p>
          </div>
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            {t("viewAllProperties")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {listings.map((item) => {
            const { features, address } = parseListingData(item);
            return (
              <Link href={`/listing/${item.id}`} key={item.id} className="group block h-full">
                <div className="h-full flex flex-col">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden mb-6 border border-border/40 group-hover:border-primary/20 transition-colors">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-xs uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm border border-border/20">
                      {item.status}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 text-sm font-bold tracking-wider shadow-xl">
                      €{item.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col space-y-4">
                    <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-xs uppercase tracking-wider font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-2" />
                      {address.city || "Greece"}
                    </div>
                    <div className="flex items-center gap-8 pt-4 border-t border-border/40 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Bed className="w-4 h-4" />
                        <span>
                          {features.beds ?? 0} {t("beds")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Bath className="w-4 h-4" />
                        <span>
                          {features.baths ?? 0} {t("baths")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-40 border border-dashed border-border/60 bg-muted/5">
            <div className="text-muted-foreground mb-4 text-lg font-medium">
              {t("noProperties")}
            </div>
            <p className="text-sm text-muted-foreground/80">{t("checkBackSoon")}</p>
          </div>
        )}

        <div className="mt-20 text-center md:hidden">
          <Link
            href="/search"
            className="inline-flex items-center justify-center w-full px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary border border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {t("viewAllProperties")}
          </Link>
        </div>
      </section>
    </div>
  );
}
