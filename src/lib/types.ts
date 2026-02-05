// Feature-specific types that are actually used
export type ListingFeatures = {
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  yearBuilt?: number | null;
  propertyType?: string;
  listingType?: string;
  amenities?: string[];
};

export type ListingAddress = {
  street?: string | null;
  city?: string | null;
  area?: string | null;
  postalCode?: string | null;
};

// Helper function that is actually used
export function parseListingData(listing: { features: unknown; address: unknown }) {
  return {
    features: (listing.features as ListingFeatures | null) || {},
    address: (listing.address as ListingAddress | null) || {},
  };
}

export type ActionResult = {
  success: boolean;
  message: string;
};
