import { z } from "zod";

// Listing validation
export const listingFeaturesSchema = z.object({
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

export const listingAddressSchema = z.object({
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
});

export const createListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Price must be positive"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  images: z.array(z.string()).default([]),
  features: listingFeaturesSchema,
  address: listingAddressSchema,
});

// Profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().url().optional().nullable(),
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
  role: z.enum(["owner", "admin", "agent", "viewer"]).default("agent"),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["owner", "admin", "agent", "viewer"]),
});

// Branding validation
export const tenantBrandingSchema = z.object({
  primary: z.string().optional(),
  accent: z.string().optional(),
  radius: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  socialFacebook: z.string().url().optional(),
  socialInstagram: z.string().url().optional(),
  socialTwitter: z.string().url().optional(),
  socialLinkedin: z.string().url().optional(),
});

export const updateBrandingSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().nullable(),
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
  customDomain: z.string().optional().nullable(),
  phone: z.string().optional(),
  companyEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  socialFacebook: z.string().url().optional(),
  socialInstagram: z.string().url().optional(),
  socialTwitter: z.string().url().optional(),
  socialLinkedin: z.string().url().optional(),
});

// Onboarding validation
export const onboardingSchema = z.object({
  agencyName: z.string().min(1, "Agency name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric with hyphens"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
});

// Plan validation
export const changePlanSchema = z.object({
  plan: z.enum(["free", "pro", "enterprise"]),
});
