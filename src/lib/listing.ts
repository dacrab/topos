import {
  Car,
  Check,
  Dumbbell,
  Fence,
  PawPrint,
  ShieldCheck,
  Snowflake,
  Sofa,
  TreePine,
  Warehouse,
  Waves,
  Zap,
} from "lucide-react";
import type { ListingAddress, ListingFeatures } from "./types";

export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "penthouse",
  "studio",
  "land",
  "commercial",
] as const;

export const AMENITIES = [
  "parking",
  "pool",
  "garden",
  "balcony",
  "elevator",
  "ac",
  "heating",
  "furnished",
  "petFriendly",
  "security",
  "gym",
  "storage",
] as const;

type Amenity = (typeof AMENITIES)[number];

const AMENITY_CONFIG: Record<
  Amenity,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  parking: { icon: Car, label: "Parking" },
  pool: { icon: Waves, label: "Pool" },
  garden: { icon: TreePine, label: "Garden" },
  balcony: { icon: Fence, label: "Balcony" },
  elevator: { icon: Zap, label: "Elevator" },
  ac: { icon: Snowflake, label: "Air Conditioning" },
  heating: { icon: Zap, label: "Heating" },
  furnished: { icon: Sofa, label: "Furnished" },
  petFriendly: { icon: PawPrint, label: "Pet Friendly" },
  security: { icon: ShieldCheck, label: "Security" },
  gym: { icon: Dumbbell, label: "Gym" },
  storage: { icon: Warehouse, label: "Storage" },
};

export function getAmenityIcon(amenity: string) {
  return AMENITY_CONFIG[amenity as Amenity]?.icon || Check;
}

export function getAmenityLabel(amenity: string) {
  return AMENITY_CONFIG[amenity as Amenity]?.label || amenity;
}

export function getPropertyTypeLabelKey(propertyType: string) {
  const suffix = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
  return `propertyType${suffix}`;
}

export function getListingStatusLabelKey(status: string) {
  return status === "PUBLISHED" ? "published" : "draft";
}

export function getAmenityLabelKey(amenity: string) {
  const suffix = amenity.charAt(0).toUpperCase() + amenity.slice(1);
  return `amenity${suffix}`;
}

export function parseListingData(listing: { features: unknown; address: unknown }) {
  return {
    features: (listing.features ?? {}) as ListingFeatures,
    address: (listing.address ?? {}) as ListingAddress,
  };
}
