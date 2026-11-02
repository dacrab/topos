import { and, eq } from "drizzle-orm";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ListingFeatureGrid } from "@/components/listings/ListingFeatureGrid";
import { AmenitiesGrid, getAddress, getAmenities, getFeatures } from "@/components/listings/shared";
import { listing } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getTenant } from "@/lib/getTenant";
import { LISTING_STATUS_LABELS, labelKey } from "@/lib/labels";
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
  const locale = await getLocale();
  const { subdomain, id } = await params;
  const { listingData, tenant } = await getListingData(subdomain, id);

  const features = getFeatures(listingData);
  const address = getAddress(listingData);
  const amenities = getAmenities(listingData);
  const [mainImage, ...otherImages] = listingData.images || [];
  const branding: TenantBranding = tenant.branding ?? {};

  return (
    <div className="pb-20">
      <div className="shell-wide py-8">
        <Link
          href={`/${subdomain}`}
          className="group mb-8 inline-flex items-center gap-2 meta-caps text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {t("backToCollection")}
        </Link>

        <header className="mb-8 grid gap-6 border-b-2 border-foreground/85 pb-6 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-9 lg:pr-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="code-pill gap-1.5">
                <Compass className="h-3 w-3 text-accent" />
                {t(labelKey(LISTING_STATUS_LABELS, listingData.status))}
              </span>
              {address.city && (
                <span className="flex items-center gap-1.5 meta-caps text-muted-foreground">
                  <MapPin className="h-3 w-3 text-accent" />
                  {address.city}
                </span>
              )}
            </div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] font-normal leading-[0.98] tracking-[-0.035em] text-foreground">
              {listingData.title}
            </h1>
            {(address.street || address.city) && (
              <p className="mt-3 meta-caps text-muted-foreground">
                {[address.street, address.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-end justify-between gap-4 border-t border-border pt-4 lg:col-span-3 lg:justify-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <span className="font-display text-3xl tracking-[-0.03em] tabular-nums text-foreground md:text-4xl">
              {formatCurrency(listingData.price, false, locale)}
            </span>
          </div>
        </header>

        {mainImage && (
          <div className="mb-12 grid h-[320px] grid-cols-1 gap-px bg-border md:h-[440px] md:grid-cols-4">
            <div className="relative overflow-hidden bg-muted md:col-span-2">
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
              <div key={img} className="relative hidden overflow-hidden bg-muted md:block">
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

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <ListingFeatureGrid features={features} t={t} />

            {listingData.description && (
              <section>
                <SectionLabel index="01" label={t("aboutProperty")} />
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {listingData.description}
                </p>
              </section>
            )}

            {amenities.length > 0 && (
              <section>
                <SectionLabel
                  index={listingData.description ? "02" : "01"}
                  label={t("amenities")}
                />
                <AmenitiesGrid amenities={amenities} t={t} />
              </section>
            )}
          </div>

          <aside>
            <div className="sticky top-24 border-t-2 border-accent bg-card">
              <div className="border-b border-border p-5">
                <h3 className="font-display text-xl tracking-[-0.01em] text-foreground">
                  {t("inquiryHeading")}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("inquiryDesc")}
                </p>
              </div>
              <div className="space-y-5 p-5">
                <InquiryForm listingId={id} subdomain={subdomain} />
                {branding.phone ? (
                  <div className="border-t border-border pt-4 text-center">
                    <p className="meta-caps text-muted-foreground">{t("orCall")}</p>
                    <a
                      href={`tel:${branding.phone}`}
                      className="mt-1 inline-block font-display text-lg text-foreground transition-colors hover:text-accent"
                    >
                      {branding.phone}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-border pb-2">
      <span className="index-caps">{index}</span>
      <h2 className="meta-caps text-muted-foreground">{label}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
