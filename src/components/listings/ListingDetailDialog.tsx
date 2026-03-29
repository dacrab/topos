"use client";

import { Bath, Bed, Calendar, Home, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { formatDate, formatPrice, truncateId } from "@/lib/format";
import { getAmenityIcon, getAmenityLabel } from "@/lib/listing-constants";
import type { ListingAddress, ListingFeatures } from "@/lib/types";
import { parseListingData } from "@/lib/types";

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
};

function buildAddressString(address: ListingAddress, fallback: string) {
  const parts = [address.street, address.area, address.city, address.postalCode].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
}

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [imgIdx, setImgIdx] = useState(0);
  if (images.length === 0 || !images[imgIdx]) return null;

  return (
    <div className="space-y-2">
      <div className="relative aspect-video bg-muted border border-border overflow-hidden">
        <Image src={images[imgIdx]} alt={title} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setImgIdx(i)}
              className={`relative w-16 h-16 flex-shrink-0 border-2 overflow-hidden ${
                i === imgIdx ? "border-primary" : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyDetailsSection({
  features,
  labels,
}: {
  features: ListingFeatures;
  labels: { [key: string]: string | undefined };
}) {
  return (
    <DetailSection icon={Home} title={labels.propertyDetails ?? ""}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {features.propertyType && (
          <Detail label={labels.type ?? ""} value={features.propertyType} capitalize />
        )}
        {features.beds != null && (
          <Detail label={labels.bedrooms ?? ""} value={features.beds} icon={Bed} />
        )}
        {features.baths != null && (
          <Detail label={labels.bathrooms ?? ""} value={features.baths} icon={Bath} />
        )}
        {features.sqft != null && (
          <Detail label={labels.size ?? ""} value={`${features.sqft} m²`} icon={Maximize} />
        )}
        {features.yearBuilt != null && (
          <Detail label={labels.yearBuilt ?? ""} value={features.yearBuilt} icon={Calendar} />
        )}
      </div>
    </DetailSection>
  );
}

function AmenitiesSection({ amenities, title }: { amenities: string[]; title: string }) {
  if (amenities.length === 0) return null;
  return (
    <DetailSection title={title}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenities.map((a) => {
          const Icon = getAmenityIcon(a);
          return (
            <div key={a} className="flex items-center gap-2 text-sm bg-secondary/30 px-3 py-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{getAmenityLabel(a)}</span>
            </div>
          );
        })}
      </div>
    </DetailSection>
  );
}

function AddressSection({
  address,
  labels,
}: {
  address: ListingAddress;
  labels: { [key: string]: string | undefined };
}) {
  if (!address.street && !address.city && !address.area && !address.postalCode) return null;
  return (
    <DetailSection icon={MapPin} title={labels.location ?? ""}>
      <div className="grid grid-cols-2 gap-4">
        {address.street && <Detail label={labels.street ?? ""} value={address.street ?? ""} />}
        {address.city && <Detail label={labels.city ?? ""} value={address.city ?? ""} />}
        {address.area && <Detail label={labels.area ?? ""} value={address.area ?? ""} />}
        {address.postalCode && (
          <Detail label={labels.postalCode ?? ""} value={address.postalCode ?? ""} />
        )}
      </div>
    </DetailSection>
  );
}

export function ListingDetailDialog({
  listing,
  trigger,
}: {
  listing: Listing;
  trigger: React.ReactNode;
}) {
  const t = useTranslations("ListingDialog");
  const [open, setOpen] = useState(false);

  const { features, address } = parseListingData(listing);
  const images = listing.images || [];
  const amenities = features.amenities || [];
  const addressString = buildAddressString(address, t("noAddress"));

  const labels = {
    propertyDetails: t("propertyDetails"),
    type: t("type"),
    bedrooms: t("bedrooms"),
    bathrooms: t("bathrooms"),
    size: t("size"),
    yearBuilt: t("yearBuilt"),
    description: t("description"),
    amenities: t("amenities"),
    location: t("location"),
    street: t("street"),
    city: t("city"),
    area: t("area"),
    postalCode: t("postalCode"),
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
              <DialogDescription className="sr-only">{t("propertyDetails")}</DialogDescription>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{addressString}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-mono font-bold">{formatPrice(listing.price)}</span>
              <div className="flex gap-2">
                <Badge>{listing.status}</Badge>
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
          <PropertyDetailsSection features={features} labels={labels} />
          {listing.description && (
            <DetailSection title={labels.description}>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </DetailSection>
          )}
          <AmenitiesSection amenities={amenities} title={labels.amenities} />
          <AddressSection address={address} labels={labels} />
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

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {title}
      </h4>
      {children}
    </div>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
  capitalize,
}: {
  label: string | undefined;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  capitalize?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </span>
      <p className={`font-medium ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
