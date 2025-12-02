"use client";

import { Bath, Bed, Calendar, Home, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getAmenityIcon,
  getAmenityLabel,
  type ListingAddress,
  type ListingFeatures,
} from "@/lib/listing-constants";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  images: string[] | null;
  features: unknown;
  address: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type ListingDetailDialogProps = {
  listing: Listing;
  trigger: React.ReactNode;
};

export function ListingDetailDialog({
  listing,
  trigger,
}: ListingDetailDialogProps) {
  const t = useTranslations("ListingDialog");
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const features = (listing.features as ListingFeatures | null) || {};
  const address = (listing.address as ListingAddress | null) || {};
  const images = listing.images || [];
  const amenities = features.amenities || [];

  const formatAddress = () => {
    const parts = [
      address.street,
      address.area,
      address.city,
      address.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : t("noAddress");
  };

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
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{formatAddress()}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-mono font-bold text-foreground">
                €{listing.price.toLocaleString()}
              </span>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-muted text-foreground border border-border/40">
                  {listing.status}
                </span>
                {features.listingType && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary border border-primary/20">
                    {features.listingType === "rent"
                      ? t("forRent")
                      : t("forSale")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Images */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="relative aspect-video bg-muted border border-border overflow-hidden">
                <Image
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-16 flex-shrink-0 border-2 overflow-hidden ${
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${listing.title} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Property Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              {t("propertyDetails")}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.propertyType && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("type")}
                  </span>
                  <p className="font-medium capitalize">
                    {features.propertyType}
                  </p>
                </div>
              )}
              {features.beds != null && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Bed className="w-3 h-3" /> {t("bedrooms")}
                  </span>
                  <p className="font-medium">{features.beds}</p>
                </div>
              )}
              {features.baths != null && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Bath className="w-3 h-3" /> {t("bathrooms")}
                  </span>
                  <p className="font-medium">{features.baths}</p>
                </div>
              )}
              {features.sqft != null && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Maximize className="w-3 h-3" /> {t("size")}
                  </span>
                  <p className="font-medium">{features.sqft} m²</p>
                </div>
              )}
              {features.yearBuilt != null && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {t("yearBuilt")}
                  </span>
                  <p className="font-medium">{features.yearBuilt}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b border-border pb-2">
                {t("description")}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b border-border pb-2">
                {t("amenities")}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm bg-secondary/30 px-3 py-2"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{getAmenityLabel(amenity)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location */}
          {(address.street ||
            address.city ||
            address.area ||
            address.postalCode) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t("location")}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {address.street && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t("street")}
                    </span>
                    <p className="font-medium">{address.street}</p>
                  </div>
                )}
                {address.city && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t("city")}
                    </span>
                    <p className="font-medium">{address.city}</p>
                  </div>
                )}
                {address.area && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t("area")}
                    </span>
                    <p className="font-medium">{address.area}</p>
                  </div>
                )}
                {address.postalCode && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t("postalCode")}
                    </span>
                    <p className="font-medium">{address.postalCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>
                {t("listedOn")}{" "}
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
              <span>ID: {listing.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
