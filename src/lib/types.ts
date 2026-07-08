import { TEAM_ROLES } from "./config";

export type { TeamRole } from "./config";
export const NON_OWNER_ROLES = TEAM_ROLES.filter((r) => r !== "owner");

export type ActionResult = { success: boolean; message: string };

export type TenantBranding = {
  primary?: string | null;
  darkPrimary?: string | null;
  accent?: string | null;
  darkAccent?: string | null;
  radius?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  description?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialLinkedin?: string | null;
};

export type ListingFeatures = {
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  propertyType: string;
  listingType: string;
  amenities: string[];
};

export type ListingAddress = {
  street: string | null;
  city: string | null;
  area: string | null;
  postalCode: string | null;
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
