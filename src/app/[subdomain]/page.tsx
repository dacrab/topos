import { and, desc, eq } from "drizzle-orm";
import { Bath, Bed, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { type ListingSelect, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getTenant } from "@/lib/getTenant";
import type { ListingAddress, ListingFeatures } from "@/lib/types";

export default async function SiteHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) notFound();
  const t = await getTranslations("Tenant");

  let listings: ListingSelect[];
  try {
    listings = await db
      .select()
      .from(listing)
      .where(and(eq(listing.tenantId, tenant.id), eq(listing.status, "PUBLISHED")))
      .orderBy(desc(listing.createdAt))
      .limit(9);
  } catch {
    listings = [];
  }

  return (
    <div>
      <section className="py-28 md:py-40 border-b border-border/40 relative overflow-hidden gradient-sunset">
        <div className="absolute inset-0 grid-pattern-dot opacity-[0.08] pointer-events-none" />
        <div className="container mx-auto px-8 max-w-screen-xl text-center space-y-6 relative z-10">
          <div className="w-full max-w-md mx-auto mb-8 text-primary/15 dark:text-primary/10 pointer-events-none select-none">
            <svg viewBox="0 0 400 100" fill="none" className="w-full h-auto">
              <title>Arch</title>
              <path
                d="M50 100V50C50 22.38 116.6 0 200 0C283.4 0 350 22.38 350 50V100"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M80 100V55C80 34.2 133.6 14 200 14C266.4 14 320 34.2 320 55V100"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </div>
          <div className="animate-fade-up">
            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight">
              {tenant.name}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mt-4">
              {t("footerDesc")}
            </p>
            <div className="mt-8">
              <Link
                href="#listings"
                className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors shadow-card"
              >
                {t("viewCollection")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="listings" className="container mx-auto px-8 max-w-screen-xl py-24">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            {t("featuredProperties")}
          </h2>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        {listings.length === 0 ? (
          <div className="border border-dashed border-border/60 py-20 text-center text-muted-foreground rounded-2xl bg-muted/20">
            <p>{t("noProperties")}</p>
            <p className="text-sm mt-2">{t("checkBackSoon")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((item, i) => {
              const features = (item.features ?? {}) as ListingFeatures;
              const address = (item.address ?? {}) as ListingAddress;
              return (
                <Link href={`/listing/${item.id}`} key={item.id} className="group block">
                  <div className="relative overflow-hidden rounded-2xl mb-4 shadow-card border border-border/60">
                    <div className="h-2 bg-primary/10 arch-top shrink-0" />
                    <div className="aspect-[4/3] bg-muted relative">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={i < 3}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                          {t("noImage")}
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-foreground text-background px-3 py-1.5 text-sm font-display font-semibold rounded-full shadow-card tabular-nums">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h3>
                  {address.city ? (
                    <div className="flex items-center text-muted-foreground text-xs mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {address.city}
                    </div>
                  ) : null}
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
