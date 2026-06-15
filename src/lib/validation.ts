import { z } from "zod";
import { LISTING_STATUSES, TEAM_ROLES } from "./config";

// Listing validation
const listingFeaturesSchema = z.object({
  beds: z.number().int().min(0).optional().nullable(),
  baths: z.number().int().min(0).optional().nullable(),
  sqft: z.number().int().min(0).optional().nullable(),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

const listingAddressSchema = z.object({
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
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
  accent: z.string().optional(),
  radius: z.string().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  customDomain: z
    .union([z.string().min(1), z.literal("")])
    .optional()
    .nullable(),
  phone: z.string().optional(),
  companyEmail: z.union([z.string().email(), z.literal("")]).optional(),
  website: z.union([z.string().url(), z.literal("")]).optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  socialFacebook: z.union([z.string().url(), z.literal("")]).optional(),
  socialInstagram: z.union([z.string().url(), z.literal("")]).optional(),
  socialTwitter: z.union([z.string().url(), z.literal("")]).optional(),
  socialLinkedin: z.union([z.string().url(), z.literal("")]).optional(),
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
