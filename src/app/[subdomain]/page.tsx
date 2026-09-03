import * as Sentry from "@sentry/nextjs";
import { and, desc, eq } from "drizzle-orm";
import { Compass, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ListingFeatureGrid } from "@/components/listings/ListingFeatureGrid";
import { getAddress, getFeatures } from "@/components/listings/shared";
import { type ListingSelect, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getTenant } from "@/lib/getTenant";

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
  } catch (err) {
    Sentry.captureException(err);
    listings = [];
  }

  return (
    <div>
      {/* HERO */}
      <section className="py-24 md:py-36 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-[0.4] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[300px] bg-primary/[0.05] blur-3xl rounded-full pointer-events-none" />

        <div className="shell-wide text-center space-y-6 relative z-10">
          <div className="animate-fade-up">
            <div className="chip-eyebrow mb-6">
              <Compass className="w-3 h-3" />
              {t("heroTagline") || "Discover your place"}
            </div>

            <h1 className="font-display text-hero-3 md:text-hero-1 font-medium tracking-tight leading-display-tight">
              {tenant.name}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mt-5 leading-relaxed">
              {t("footerDesc")}
            </p>
            <div className="mt-9">
              <Link href="#listings" className="btn-primary btn-xl">
                {t("viewCollection")}
                <Compass className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="listings" className="shell-wide py-20 md:py-24">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
            {t("featuredProperties")}
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {listings.length === 0 ? (
          <div className="border border-dashed border-border py-20 text-center text-muted-foreground rounded-xl bg-muted/20">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <p>{t("noProperties")}</p>
            <p className="text-sm mt-2">{t("checkBackSoon")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item, i) => {
              const features = getFeatures(item);
              const address = getAddress(item);
              return (
                <Link
                  href={`/${subdomain}/listing/${item.id}`}
                  key={item.id}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl mb-4 border border-border bg-card transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-0.5">
                    <div className="aspect-[4/3] bg-muted relative">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={i < 3}
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                          {t("noImage")}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-foreground/90 text-background px-3 py-1.5 text-sm font-semibold rounded-lg shadow-card tabular-nums backdrop-blur-sm">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h3>
                  {address.city ? (
                    <div className="flex items-center text-muted-foreground text-xs mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {address.city}
                    </div>
                  ) : null}
                  <ListingFeatureGrid features={features} t={t} variant="card" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
