"use client";

import { Bath, Bed, Calendar, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ListingSelect } from "@/db/schema";
import { formatDate, formatPrice, truncateId } from "@/lib/format";
import { getLabelKey, getListingStatusLabelKey, parseListingData } from "@/lib/listing";
import type { ListingAddress, ListingFeatures } from "@/lib/types";

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  if (images.length === 0 || !images[idx]) return null;
  return (
    <div className="space-y-2">
      <div className="relative aspect-video bg-muted border border-border overflow-hidden">
        <Image src={images[idx]} alt={title} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative w-16 h-16 shrink-0 border-2 overflow-hidden ${i === idx ? "border-primary" : "border-border opacity-60 hover:opacity-100"}`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyDetails({ features, t }: { features: ListingFeatures; t: (k: string) => string }) {
  const items = [
    features.beds != null ? { label: t("bedrooms"), value: features.beds, icon: Bed } : null,
    features.baths != null ? { label: t("bathrooms"), value: features.baths, icon: Bath } : null,
    features.sqft != null
      ? { label: t("size"), value: `${features.sqft} m²`, icon: Maximize }
      : null,
    features.yearBuilt != null
      ? { label: t("yearBuilt"), value: features.yearBuilt, icon: Calendar }
      : null,
  ].filter(Boolean) as {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="section-title">{t("propertyDetails")}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="space-y-1">
            <span className="detail-label flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {label}
            </span>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Amenities({ amenities, t }: { amenities: string[]; t: (k: string) => string }) {
  if (!amenities.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="section-title">{t("amenities")}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {amenities.map((a) => (
          <div key={a} className="border border-border px-3 py-2 text-sm">
            {t(getLabelKey("amenity", a))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressDetails({ address, t }: { address: ListingAddress; t: (k: string) => string }) {
  const parts = [
    address.street ? { label: t("street"), value: address.street } : null,
    address.city ? { label: t("city"), value: address.city } : null,
    address.area ? { label: t("area"), value: address.area } : null,
    address.postalCode ? { label: t("postalCode"), value: address.postalCode } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  if (!parts.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="section-title flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {t("location")}
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {parts.map(({ label, value }) => (
          <div key={label} className="space-y-1">
            <span className="detail-label">{label}</span>
            <p className="font-medium text-sm">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingDetailDialog({
  listing,
  trigger,
}: {
  listing: ListingSelect;
  trigger: React.ReactNode;
}) {
  const t = useTranslations("Listings");
  const [open, setOpen] = useState(false);
  const { features, address } = parseListingData(listing);
  const images = listing.images || [];
  const amenities = (features.amenities || []) as string[];
  const addressParts = [address.street, address.area, address.city, address.postalCode].filter(
    Boolean,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {listing.title}
              </DialogTitle>
              <DialogDescription className="sr-only">{t("propertyDetails")}</DialogDescription>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {addressParts.length ? addressParts.join(", ") : t("noAddress")}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-2xl font-mono font-bold">{formatPrice(listing.price)}</span>
              <div className="flex gap-2">
                <Badge>{t(getListingStatusLabelKey(listing.status))}</Badge>
                {features.listingType && (
                  <Badge variant="primary">
                    {features.listingType === "rent" ? t("forRent") : t("forSale")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <ImageGallery images={images} title={listing.title} />
          <PropertyDetails features={features} t={t} />
          {listing.description && (
            <div className="space-y-2">
              <h4 className="section-title">{t("description")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}
          <Amenities amenities={amenities} t={t} />
          <AddressDetails address={address} t={t} />
          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
            <span>
              {t("listedOn")} {formatDate(listing.createdAt)}
            </span>
            <span>ID: {truncateId(listing.id)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
