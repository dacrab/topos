import { Bath, Bed, Calendar, Maximize } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingSelect } from "@/db/schema";
import type { ListingAddress, ListingFeatures } from "@/lib/types";
import { cn } from "@/lib/utils";

export function getFeatures(listing: ListingSelect) {
  return (listing.features ?? {}) as ListingFeatures;
}

export function getAddress(listing: ListingSelect) {
  return (listing.address ?? {}) as ListingAddress;
}

export function getAmenities(listing: ListingSelect) {
  return (getFeatures(listing).amenities || []) as string[];
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
      <div className="relative aspect-video bg-muted border border-border overflow-hidden">
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
                "relative w-16 h-16 shrink-0 border-2 overflow-hidden rounded-none p-0",
                i === current ? "border-primary" : "border-border opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={img}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
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
  features: ListingFeatures;
  t: (key: string) => string;
}) {
  if (!features.beds && !features.baths && !features.sqft && !features.yearBuilt) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {features.beds != null && (
        <div className="space-y-1">
          <span className="detail-label flex items-center gap-1">
            <Bed className="w-3 h-3" />
            {t("bedrooms")}
          </span>
          <p className="font-medium">{features.beds}</p>
        </div>
      )}
      {features.baths != null && (
        <div className="space-y-1">
          <span className="detail-label flex items-center gap-1">
            <Bath className="w-3 h-3" />
            {t("bathrooms")}
          </span>
          <p className="font-medium">{features.baths}</p>
        </div>
      )}
      {features.sqft != null && (
        <div className="space-y-1">
          <span className="detail-label flex items-center gap-1">
            <Maximize className="w-3 h-3" />
            {t("size")}
          </span>
          <p className="font-medium">{features.sqft} m²</p>
        </div>
      )}
      {features.yearBuilt != null && (
        <div className="space-y-1">
          <span className="detail-label flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {t("yearBuilt")}
          </span>
          <p className="font-medium">{features.yearBuilt}</p>
        </div>
      )}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {amenities.map((a) => (
        <div key={a} className="border border-border px-3 py-2 text-sm">
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
  address: ListingAddress;
  t: (key: string) => string;
}) {
  if (!address.street && !address.city && !address.area && !address.postalCode) return null;
  return (
    <div className="grid grid-cols-2 gap-4">
      {address.street && (
        <div className="space-y-1">
          <span className="detail-label">{t("street")}</span>
          <p className="font-medium text-sm">{address.street}</p>
        </div>
      )}
      {address.city && (
        <div className="space-y-1">
          <span className="detail-label">{t("city")}</span>
          <p className="font-medium text-sm">{address.city}</p>
        </div>
      )}
      {address.area && (
        <div className="space-y-1">
          <span className="detail-label">{t("area")}</span>
          <p className="font-medium text-sm">{address.area}</p>
        </div>
      )}
      {address.postalCode && (
        <div className="space-y-1">
          <span className="detail-label">{t("postalCode")}</span>
          <p className="font-medium text-sm">{address.postalCode}</p>
        </div>
      )}
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
      <Badge>{status === "PUBLISHED" ? t("published") : t("draft")}</Badge>
      {listingType && (
        <Badge variant="primary">{listingType === "rent" ? t("forRent") : t("forSale")}</Badge>
      )}
    </div>
  );
}
