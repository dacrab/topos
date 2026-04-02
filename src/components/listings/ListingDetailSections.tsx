"use client";

import { Bath, Bed, Calendar, Home, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { getAmenityIcon } from "@/lib/listing";
import type { ListingAddress, ListingFeatures } from "@/lib/types";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
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

export function PropertyDetailsSection({
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
          <Detail
            label={labels.type ?? ""}
            value={labels[`propertyType.${features.propertyType}`]}
          />
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

export function AmenitiesSection({
  amenities,
  title,
  labels,
}: {
  amenities: string[];
  title: string;
  labels: { [key: string]: string | undefined };
}) {
  if (amenities.length === 0) return null;

  return (
    <DetailSection title={title}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenities.map((a) => {
          const Icon = getAmenityIcon(a);
          return (
            <div key={a} className="flex items-center gap-2 text-sm bg-secondary/30 px-3 py-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{labels[`amenity.${a}`] ?? a}</span>
            </div>
          );
        })}
      </div>
    </DetailSection>
  );
}

export function AddressSection({
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
        {address.street && <Detail label={labels.street ?? ""} value={address.street} />}
        {address.city && <Detail label={labels.city ?? ""} value={address.city} />}
        {address.area && <Detail label={labels.area ?? ""} value={address.area} />}
        {address.postalCode && (
          <Detail label={labels.postalCode ?? ""} value={address.postalCode} />
        )}
      </div>
    </DetailSection>
  );
}

export function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
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

export function Detail({
  label,
  value,
  icon: Icon,
  capitalize,
}: {
  label: string | undefined;
  value: ReactNode;
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
