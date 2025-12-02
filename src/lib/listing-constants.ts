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

type PropertyType = (typeof PROPERTY_TYPES)[number];
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

export type ListingFeatures = {
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  yearBuilt?: number | null;
  propertyType?: string | null;
  listingType?: string | null;
  amenities?: string[] | null;
};

export type ListingAddress = {
  street?: string | null;
  city?: string | null;
  area?: string | null;
  postalCode?: string | null;
};
