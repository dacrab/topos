import { and, eq } from "drizzle-orm";
import { ArrowLeft, Bath, Bed, Calendar, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AmenitiesGrid, getAddress, getAmenities, getFeatures } from "@/components/listings/shared";
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
  const branding = (tenant.branding ?? {}) as TenantBranding;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-8 max-w-screen-xl py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("backToCollection")}
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span className="border-2 border-foreground px-2 py-1">
                {t(listingData.status === "PUBLISHED" ? "published" : "draft")}
              </span>
              {address.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {address.city}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{listingData.title}</h1>
            {(address.street || address.city) && (
              <p className="text-muted-foreground mt-1">
                {[address.street, address.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono">
            {formatCurrency(listingData.price)}
          </div>
        </div>

        {mainImage && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-12 h-[400px]">
            <div className="md:col-span-2 relative bg-muted border-2 border-foreground overflow-hidden">
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
                className="hidden md:block relative bg-muted border-2 border-foreground overflow-hidden"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border-2 border-foreground bg-foreground">
              {[
                { icon: Bed, value: features.beds ?? 0, label: t("bedrooms") },
                { icon: Bath, value: features.baths ?? 0, label: t("bathrooms") },
                {
                  icon: Maximize,
                  value: features.sqft ? `${features.sqft} m²` : "—",
                  label: t("sqMeters"),
                },
                { icon: Calendar, value: features.yearBuilt ?? "—", label: t("yearBuilt") },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-card p-6 text-center">
                  <Icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                  <div className="mono-price text-xl">{value}</div>
                  <div className="detail-label mt-1">{label}</div>
                </div>
              ))}
            </div>

            {listingData.description && (
              <div>
                <h2 className="label-caps mb-3">{t("aboutProperty")}</h2>
                <p className="text-muted-foreground leading-relaxed">{listingData.description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div>
                <h2 className="label-caps mb-3">{t("amenities")}</h2>
                <AmenitiesGrid amenities={amenities} t={t} />
              </div>
            )}
          </div>

          <div>
            <div className="border-2 border-foreground p-6 space-y-4 sticky top-24">
              <div>
                <h3 className="font-bold">{t("inquiryHeading")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("inquiryDesc")}</p>
              </div>
              <InquiryForm listingId={id} subdomain={subdomain} />
              {branding.phone ? (
                <div className="pt-4 border-t text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("orCall")}</p>
                  <a
                    href={`tel:${branding.phone}`}
                    className="font-bold hover:text-primary transition-colors"
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
  );
}
