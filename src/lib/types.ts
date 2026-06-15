import { TEAM_ROLES } from "./config";

export type { TeamRole } from "./config";
export const NON_OWNER_ROLES = TEAM_ROLES.filter((r) => r !== "owner");

export type ActionResult = { success: boolean; message: string };

export type TenantBranding = {
  primary?: string;
  accent?: string;
  radius?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
};

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

export type NotificationSettings = {
  emailNewLead: boolean;
  emailNewOffer: boolean;
  emailListingUpdate: boolean;
  emailWeeklyDigest: boolean;
  pushNewLead: boolean;
  pushNewOffer: boolean;
  pushListingUpdate: boolean;
  marketingEmails: boolean;
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

export const UPLOAD_TYPES = ["listing", "logo", "profile", "user"] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];
