// Re-export schema types
export type {
  ActivitySelect,
  AgentSelect,
  ContactSelect,
  ListingSelect,
  TenantSelect,
  UserSelect,
} from "@/db/schema";

// Feature-specific types
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
  zip?: string | null; // alias for postalCode
};

// Helper to safely cast listing JSON fields
export function parseListingData(listing: {
  features: unknown;
  address: unknown;
}) {
  return {
    features: (listing.features as ListingFeatures | null) || {},
    address: (listing.address as ListingAddress | null) || {},
  };
}

export type TenantBranding = {
  primary?: string;
  accent?: string;
  radius?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
};

export type NotificationSettings = {
  emailNewLead?: boolean;
  emailNewListing?: boolean;
  emailWeeklyReport?: boolean;
  pushNewLead?: boolean;
  pushNewListing?: boolean;
};

export type ActionResult = {
  success: boolean;
  message: string;
};
