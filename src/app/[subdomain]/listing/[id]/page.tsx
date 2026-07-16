import { and, eq } from "drizzle-orm";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ListingFeatureGrid } from "@/components/listings/ListingFeatureGrid";
import { AmenitiesGrid, getAddress, getAmenities, getFeatures } from "@/components/listings/shared";
import { TopBar } from "@/components/ui/top-bar";
import { listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getTenant } from "@/lib/getTenant";
import type { TenantBranding } from "@/lib/types";
import { InquiryForm } from "./InquiryForm";

async function getListingData(subdomain: string, id: string) {
  const tenant = await getTenant(subdomain);
  if (!tenant) notFound();

  const listingData = await db.query.listing.findFirst({
    where: and(eq(listing.id, id), eq(listing.tenantId, tenant.id)),
  });
  if (!listingData) notFound();

  return { listingData, tenant };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string }>;
}) {
  const t = await getTranslations("ListingDetail");
  const { subdomain, id } = await params;
  const { listingData, tenant } = await getListingData(subdomain, id);

  const features = getFeatures(listingData);
  const address = getAddress(listingData);
  const amenities = getAmenities(listingData);
  const [mainImage, ...otherImages] = listingData.images || [];
  const branding: TenantBranding = tenant.branding ?? {};

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-8 max-w-7xl py-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t("backToCollection")}
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 border border-border/60 rounded-full px-3 py-1 text-eyebrow font-mono tracking-wider text-muted-foreground">
                <Compass className="w-3 h-3" />
                {t(listingData.status === "PUBLISHED" ? "published" : "draft")}
              </span>
              {address.city && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {address.city}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {listingData.title}
            </h1>
            {(address.street || address.city) && (
              <p className="text-muted-foreground mt-1">
                {[address.street, address.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="font-display text-3xl md:text-4xl font-semibold tabular-nums text-foreground">
            {formatCurrency(listingData.price)}
          </div>
        </div>

        {mainImage && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-12 h-[400px]">
            <div className="md:col-span-2 relative bg-muted border border-border/40 shadow-card rounded-2xl overflow-hidden">
              <Image
                src={mainImage}
                alt={listingData.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {otherImages.slice(0, 4).map((img) => (
              <div
                key={img}
                className="hidden md:block relative bg-muted border border-border/40 rounded-2xl overflow-hidden"
              >
                <Image
                  src={img}
                  alt={listingData.title}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <ListingFeatureGrid features={features} t={t} />

            {listingData.description && (
              <div>
                <h2 className="label-caps mb-3 text-primary/70">{t("aboutProperty")}</h2>
                <p className="text-muted-foreground leading-relaxed">{listingData.description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div>
                <h2 className="label-caps mb-3 text-primary/70">{t("amenities")}</h2>
                <AmenitiesGrid amenities={amenities} t={t} />
              </div>
            )}
          </div>

          <div>
            <div className="border border-border/40 shadow-card rounded-2xl overflow-hidden sticky top-24 bg-card">
              <TopBar />
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      {t("inquiryHeading")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{t("inquiryDesc")}</p>
                  </div>
                </div>
                <InquiryForm listingId={id} subdomain={subdomain} />
                {branding.phone ? (
                  <div className="pt-4 border-t border-border/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t("orCall")}</p>
                    <a
                      href={`tel:${branding.phone}`}
                      className="font-display font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {branding.phone}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
