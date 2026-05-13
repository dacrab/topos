"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  trigger: React.ReactNode;
}) {
  const t = useTranslations("Listings");
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
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
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
              <span className="text-2xl font-mono font-bold">{formatCurrency(listing.price)}</span>
              <StatusBadges status={listing.status} listingType={features.listingType} t={t} />
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">
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
              <h4 className="section-title">{t("propertyDetails")}</h4>
              <FeatureGrid features={features} t={t} />
            </div>
          )}

          {listing.description && (
            <div className="space-y-2">
              <h4 className="section-title">{t("description")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="space-y-3">
              <h4 className="section-title">{t("amenities")}</h4>
              <AmenitiesGrid amenities={amenities} t={t} />
            </div>
          )}

          {(address.street || address.city || address.area || address.postalCode) && (
            <div className="space-y-3">
              <h4 className="section-title flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t("location")}
              </h4>
              <LocationGrid address={address} t={t} />
            </div>
          )}

          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
            <span>
              {t("listedOn")} {formatDate(listing.createdAt)}
            </span>
            <span>ID: {`${listing.id.slice(0, 8)}...`}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
