"use client";

import { Bath, Bed, Calendar, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ListingSelect } from "@/db/schema";
import { formatDate, formatPrice, truncateId } from "@/lib/format";
import type { ListingAddress, ListingFeatures } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  
  const features = (listing.features ?? {}) as ListingFeatures;
  const address = (listing.address ?? {}) as ListingAddress;
  const images = listing.images || [];
  const amenities = (features.amenities || []) as string[];
  const addressParts = [address.street, address.area, address.city, address.postalCode].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">{listing.title}</DialogTitle>
              <DialogDescription className="sr-only">{t("propertyDetails")}</DialogDescription>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{addressParts.length ? addressParts.join(", ") : t("noAddress")}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-2xl font-mono font-bold">{formatPrice(listing.price)}</span>
              <div className="flex gap-2">
                <Badge>{listing.status === "PUBLISHED" ? t("published") : t("draft")}</Badge>
                {features.listingType && (
                  <Badge variant="primary">{features.listingType === "rent" ? t("forRent") : t("forSale")}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {images.length > 0 && images[imageIdx] && (
            <div className="space-y-2">
              <div className="relative aspect-video bg-muted border border-border overflow-hidden">
                <Image src={images[imageIdx]} alt={listing.title} fill className="object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setImageIdx(i)}
                      className={cn(
                        "relative w-16 h-16 shrink-0 border-2 overflow-hidden",
                        i === imageIdx ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image src={img} alt={`${listing.title} ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {(features.beds != null || features.baths != null || features.sqft != null || features.yearBuilt != null) && (
            <div className="space-y-3">
              <h4 className="section-title">{t("propertyDetails")}</h4>
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
            </div>
          )}

          {listing.description && (
            <div className="space-y-2">
              <h4 className="section-title">{t("description")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="space-y-3">
              <h4 className="section-title">{t("amenities")}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map((a) => (
                  <div key={a} className="border border-border px-3 py-2 text-sm">
                    {t(`amenity${a.charAt(0).toUpperCase()}${a.slice(1)}`)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(address.street || address.city || address.area || address.postalCode) && (
            <div className="space-y-3">
              <h4 className="section-title flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t("location")}
              </h4>
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
            </div>
          )}

          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between">
            <span>{t("listedOn")} {formatDate(listing.createdAt)}</span>
            <span>ID: {truncateId(listing.id)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
