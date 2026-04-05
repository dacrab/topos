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

export function getLabelKey(prefix: string, value: string) {
  return `${prefix}${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function getListingStatusLabelKey(status: string) {
  return status === "PUBLISHED" ? "published" : "draft";
}

export function parseListingData(listing: { features: unknown; address: unknown }) {
  return {
    features: (listing.features ?? {}) as ListingFeatures,
    address: (listing.address ?? {}) as ListingAddress,
  };
}
