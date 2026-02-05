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

// Types that are actually imported and used
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

export type TeamRole = "ADMIN" | "AGENT";

// Match actual database schema for activities
export type ActivitySelect = {
  id: string;
  userId: string | null;
  createdAt: Date;
  tenantId: string;
  description: string | null;
  metadata: unknown;
  type: string;
  title: string;
  listingId: string | null;
  contactId: string | null;
};
