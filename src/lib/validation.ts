import { z } from "zod";
import { LISTING_STATUSES, TEAM_ROLES } from "./config";

// Listing validation
const listingFeaturesSchema = z.object({
  beds: z.number().int().min(0).nullable().default(null),
  baths: z.number().int().min(0).nullable().default(null),
  sqft: z.number().int().min(0).nullable().default(null),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .nullable()
    .default(null),
  propertyType: z.string().default(""),
  listingType: z.string().default(""),
  amenities: z.array(z.string()).default([]),
});

const listingAddressSchema = z.object({
  street: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  area: z.string().nullable().default(null),
  postalCode: z.string().nullable().default(null),
});

export const createListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Price must be positive"),
  status: z.enum(LISTING_STATUSES).default("DRAFT"),
  images: z.array(z.string()).default([]),
  features: listingFeaturesSchema,
  address: listingAddressSchema,
});

// Profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
});

// Notifications validation
export const notificationSettingsSchema = z.object({
  emailNewLead: z.boolean(),
  emailNewOffer: z.boolean(),
  emailListingUpdate: z.boolean(),
  emailWeeklyDigest: z.boolean(),
  pushNewLead: z.boolean(),
  pushNewOffer: z.boolean(),
  pushListingUpdate: z.boolean(),
  marketingEmails: z.boolean(),
});

// Team validation
export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(TEAM_ROLES).default("agent"),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(TEAM_ROLES),
});

// Branding validation
export const updateBrandingSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  primary: z.string().optional(),
  darkPrimary: z.string().optional(),
  accent: z.string().optional(),
  darkAccent: z.string().optional(),
  radius: z.string().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).nullable().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .nullable()
    .optional(),
  customDomain: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  companyEmail: z
    .union([z.string().email(), z.literal("")])
    .nullable()
    .optional(),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  socialFacebook: z.string().nullable().optional(),
  socialInstagram: z.string().nullable().optional(),
  socialTwitter: z.string().nullable().optional(),
  socialLinkedin: z.string().nullable().optional(),
});

// Onboarding validation
export const onboardingSchema = z.object({
  agencyName: z.string().min(1, "Agency name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric with hyphens"),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  address: z.string().optional(),
  website: z.union([z.string().url(), z.literal("")]).optional(),
});
