"use client";

import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DividerHeading } from "@/components/ui/page";
import type { ListingSelect } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  AmenitiesGrid,
  FeatureGrid,
  getAddress,
  getAmenities,
  getFeatures,
  ImageGallery,
  LocationGrid,
  StatusBadges,
} from "./shared";

export function ListingDetailDialog({
  listing,
  trigger,
}: {
  listing: ListingSelect;
  trigger: ReactElement;
}) {
  const t = useTranslations("Listings");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);

  const features = getFeatures(listing);
  const address = getAddress(listing);
  const amenities = getAmenities(listing);
  const images = listing.images || [];
  const addressParts = [address.street, address.area, address.city, address.postalCode].filter(
    Boolean,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-foreground/85 pb-5">
          <div className="min-w-0 flex-1">
            <DialogTitle className="card-title">{listing.title}</DialogTitle>
            <DialogDescription className="sr-only">{t("propertyDetails")}</DialogDescription>
            <div className="mt-2 flex items-center gap-1.5 meta-caps text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-accent" />
              <span className="truncate">
                {addressParts.length ? addressParts.join(", ") : t("noAddress")}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="font-display text-2xl leading-none tracking-[-0.02em] tabular-nums">
              {formatCurrency(listing.price, false, locale)}
            </span>
            <StatusBadges status={listing.status} listingType={features.listingType} t={t} />
          </div>
        </header>

        <div className="mt-5 space-y-6">
          {images.length > 0 && (
            <ImageGallery
              images={images}
              title={listing.title}
              current={imageIdx}
              onSelect={setImageIdx}
            />
          )}

          {(features.beds != null ||
            features.baths != null ||
            features.sqft != null ||
            features.yearBuilt != null) && (
            <div className="space-y-3">
              <DividerHeading title={t("propertyDetails")} />
              <FeatureGrid features={features} t={t} />
            </div>
          )}

          {listing.description && (
            <div className="space-y-3">
              <DividerHeading title={t("description")} />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="space-y-3">
              <DividerHeading title={t("amenities")} />
              <AmenitiesGrid amenities={amenities} t={t} />
            </div>
          )}

          {(address.street || address.city || address.area || address.postalCode) && (
            <div className="space-y-3">
              <DividerHeading title={t("location")} icon={<MapPin className="h-3.5 w-3.5" />} />
              <LocationGrid address={address} t={t} />
            </div>
          )}

          <div className="flex justify-between gap-4 border-t border-border pt-4 micro-caps text-muted-foreground tabular-nums">
            <span>
              {t("listedOn")} {formatDate(listing.createdAt, locale)}
            </span>
            <span>ID: {listing.id.slice(0, 8)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
