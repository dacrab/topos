import { and, desc, eq } from "drizzle-orm";
import { Bath, Bed, Compass, MapPin } from "lucide-react";
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
      {/* ════════════════════════════════════════════
         HERO
         ════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 border-b border-border/40 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-warning/5 via-primary/[0.03] to-accent/[0.04]" />
        <div className="absolute inset-0 grid-pattern-dot opacity-[0.06] pointer-events-none" />
        <div className="absolute inset-0 texture-plaster opacity-[0.02] pointer-events-none" />

        {/* Decorative arch */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] text-primary/[0.04] dark:text-primary/[0.06] pointer-events-none select-none">
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

        <div className="container mx-auto px-8 max-w-screen-xl text-center space-y-6 relative z-10">
          <div className="animate-fade-up">
            {/* Epithet */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 bg-primary/[0.04] rounded-full text-[11px] text-primary font-mono tracking-[0.15em]">
                <Compass className="w-3 h-3" />
                {t("heroTagline") || "Discover your place"}
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
              {tenant.name}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mt-4 leading-relaxed">
              {t("footerDesc")}
            </p>
            <div className="mt-8">
              <Link
                href="#listings"
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-12 px-8 text-sm font-medium rounded-full hover:bg-foreground/90 transition-all shadow-card hover:shadow-card-hover active:scale-[0.97]"
              >
                {t("viewCollection")}
                <Compass className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         LISTINGS
         ════════════════════════════════════════════ */}
      <section id="listings" className="container mx-auto px-8 max-w-screen-xl py-24">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            {t("featuredProperties")}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        {listings.length === 0 ? (
          <div className="border border-dashed border-border/60 py-20 text-center text-muted-foreground rounded-3xl bg-muted/20">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-6 h-6 text-primary" />
            </div>
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
                  <div className="relative overflow-hidden rounded-2xl mb-4 shadow-card border border-border/40 bg-card transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-0.5">
                    <div className="aspect-[4/3] bg-muted relative">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={i < 3}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                          {t("noImage")}
                        </div>
                      )}
                      {/* Price badge */}
                      <div className="absolute bottom-3 left-3 bg-foreground/90 text-background px-3 py-1.5 text-sm font-display font-semibold rounded-full shadow-card tabular-nums backdrop-blur-sm">
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
