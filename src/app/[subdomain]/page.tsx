import * as Sentry from "@sentry/nextjs";
import { and, desc, eq } from "drizzle-orm";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ListingFeatureGrid } from "@/components/listings/ListingFeatureGrid";
import { getAddress, getFeatures } from "@/components/listings/shared";
import { EmptyState } from "@/components/ui/page";
import { type ListingSelect, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getTenant } from "@/lib/getTenant";

export default async function SiteHomePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) notFound();
  const t = await getTranslations("Tenant");
  const locale = await getLocale();

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
      <section className="border-b-2 border-foreground/85">
        <div className="shell-wide">
          <div className="grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-0">
            <div className="lg:col-span-8 lg:pr-10">
              <p className="chip-eyebrow mb-8">{t("heroTagline")}</p>
              <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-normal leading-[0.92] tracking-[-0.04em]">
                {tenant.name}
              </h1>
            </div>

            <div className="flex flex-col justify-end gap-7 lg:col-span-4 lg:border-l lg:border-border lg:pl-8">
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                {tenant.branding?.description || t("footerDesc")}
              </p>
              <Link href="#listings" className="btn-primary btn-md w-full justify-between">
                {t("viewCollection")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-card/50">
          <div className="shell-wide flex items-center justify-between gap-4 py-3 meta-caps text-muted-foreground">
            <span>{t("featuredProperties")}</span>
            <span className="tabular-nums">
              <span className="text-accent">{String(listings.length).padStart(2, "0")}</span> / 09
            </span>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="listings" className="shell-wide py-16 md:py-24">
        <div className="mb-8 flex items-end justify-between border-b-2 border-foreground/85 pb-3">
          <h2 className="card-title md:text-3xl">{t("featuredProperties")}</h2>
          <span className="meta-caps text-muted-foreground">{t("properties")}</span>
        </div>

        {listings.length === 0 ? (
          <EmptyState className="py-20" icon={<Compass className="h-5 w-5" />}>
            <span className="block font-medium text-foreground">{t("noProperties")}</span>
            {t("checkBackSoon")}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item, i) => {
              const features = getFeatures(item);
              const address = getAddress(item);
              return (
                <Link
                  href={`/${subdomain}/listing/${item.id}`}
                  key={item.id}
                  className="group flex flex-col"
                >
                  <div className="media-frame">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={i < 3}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center meta-caps text-muted-foreground">
                        {t("noImage")}
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 bg-foreground/90 px-2 py-1 font-mono text-xs tabular-nums text-background backdrop-blur-sm">
                      {formatCurrency(item.price, false, locale)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 border-t border-border pt-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                        {item.title}
                      </h3>
                    </div>
                    {address.city ? (
                      <div className="flex items-center gap-1.5 micro-caps text-muted-foreground">
                        <MapPin className="h-3 w-3 text-accent" />
                        {address.city}
                      </div>
                    ) : null}
                    <div className="mt-auto pt-2">
                      <ListingFeatureGrid features={features} t={t} variant="card" />
                    </div>
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
