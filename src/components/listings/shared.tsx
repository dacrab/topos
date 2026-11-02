import { Bath, Bed, Calendar, Maximize } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingSelect } from "@/db/schema";
import { LISTING_STATUS_LABELS, labelKey } from "@/lib/labels";
import type { ListingAddress, ListingFeatures } from "@/lib/types";
import { cn } from "@/lib/utils";

// The json columns are unconstrained at the DB level, so rows written before a
// field existed (or by an older client) can be partial. Returning a partial
// shape keeps callers honest instead of asserting fields are present.
export function getFeatures(listing: ListingSelect): Partial<ListingFeatures> {
  return listing.features ?? {};
}

export function getAddress(listing: ListingSelect): Partial<ListingAddress> {
  return listing.address ?? {};
}

export function getAmenities(listing: ListingSelect): string[] {
  return getFeatures(listing).amenities ?? [];
}

export function ImageGallery({
  images,
  title,
  current,
  onSelect,
}: {
  images: string[];
  title: string;
  current: number;
  onSelect: (i: number) => void;
}) {
  if (!images[current]) return null;
  return (
    <div className="space-y-2">
      <div className="relative aspect-video overflow-hidden border border-border bg-muted">
        <Image src={images[current]} alt={title} fill className="object-cover" sizes="100vw" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <Button
              key={img}
              type="button"
              variant="ghost"
              size="auto"
              onClick={() => onSelect(i)}
              aria-label={`${title} ${i + 1}`}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden border p-0 transition-opacity",
                i === current
                  ? "border-foreground opacity-100"
                  : "border-border opacity-55 hover:opacity-100",
              )}
            >
              <Image
                src={img}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FeatureGrid({
  features,
  t,
}: {
  features: Partial<ListingFeatures>;
  t: (key: string) => string;
}) {
  const items = [
    { icon: Bed, value: features.beds, label: t("bedrooms") },
    { icon: Bath, value: features.baths, label: t("bathrooms") },
    { icon: Maximize, value: features.sqft, label: t("size"), suffix: " m²" },
    { icon: Calendar, value: features.yearBuilt, label: t("yearBuilt") },
  ].filter((item) => item.value != null);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 border-t-2 border-foreground/85 sm:grid-cols-4">
      {items.map(({ icon: Icon, value, label, suffix }) => (
        <div
          key={label}
          className="border-b border-border py-4 pr-3 sm:border-b-0 sm:border-l sm:pl-3 sm:first:border-l-0 sm:first:pl-0"
        >
          <span className="flex items-center gap-1.5 micro-caps text-muted-foreground">
            <Icon className="h-3 w-3 text-accent" />
            {label}
          </span>
          <p className="mt-1.5 font-display text-xl leading-none tabular-nums">
            {value}
            {suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AmenitiesGrid({
  amenities,
  t,
}: {
  amenities: string[];
  t: (key: string) => string;
}) {
  if (!amenities.length) return null;
  return (
    <div className="grid grid-cols-2 border-t border-border sm:grid-cols-3">
      {amenities.map((a) => (
        <div
          key={a}
          className="flex items-center gap-2 border-b border-border px-1 py-2.5 text-sm text-muted-foreground"
        >
          <span className="h-1 w-1 shrink-0 bg-accent" />
          {t(`amenity${a.charAt(0).toUpperCase()}${a.slice(1)}`)}
        </div>
      ))}
    </div>
  );
}

export function LocationGrid({
  address,
  t,
}: {
  address: Partial<ListingAddress>;
  t: (key: string) => string;
}) {
  const items = [
    { label: t("street"), value: address.street },
    { label: t("city"), value: address.city },
    { label: t("area"), value: address.area },
    { label: t("postalCode"), value: address.postalCode },
  ].filter((item) => Boolean(item.value));

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {items.map(({ label, value }) => (
        <div key={label} className="space-y-1">
          <span className="micro-caps text-muted-foreground">{label}</span>
          <p className="text-sm">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function StatusBadges({
  status,
  listingType,
  t,
}: {
  status: string;
  listingType?: string | undefined;
  t: (key: string) => string;
}) {
  return (
    <div className="flex gap-2">
      <Badge variant={status === "PUBLISHED" ? "success" : "default"}>
        {t(labelKey(LISTING_STATUS_LABELS, status))}
      </Badge>
      {listingType && (
        <Badge variant="primary">{listingType === "rent" ? t("forRent") : t("forSale")}</Badge>
      )}
    </div>
  );
}
