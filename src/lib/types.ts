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

export function parseListingData(listing: { features: unknown; address: unknown }) {
  return {
    features: (listing.features ?? {}) as ListingFeatures,
    address: (listing.address ?? {}) as ListingAddress,
  };
}

export type ActionResult = {
  success: boolean;
  message: string;
};

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
  emailNewOffer?: boolean;
  emailListingUpdate?: boolean;
  emailWeeklyDigest?: boolean;
  pushNewLead?: boolean;
  pushNewOffer?: boolean;
  pushListingUpdate?: boolean;
  marketingEmails?: boolean;
};

export type TeamMemberData = {
  member: { id: string; role: string };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export type InvitationData = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
};

// Re-exported from constants to keep a single source of truth
export type { TeamRole } from "@/lib/constants";
