import { z } from "zod";
import { LISTING_STATUSES, TEAM_ROLES } from "./config";
import type { ActionResult } from "./types";

export function validationError(error: z.ZodError): ActionResult {
  return {
    success: false,
    message: error.issues[0]?.message ?? "Invalid input",
  };
}

/** Only browser-navigable URLs: blocks `javascript:` and other schemes. */
const httpUrl = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "Enter a valid http(s) URL");

const optionalHttpUrl = z.union([httpUrl, z.literal(""), z.null()]).optional();

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

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: optionalHttpUrl,
});

export const notificationSettingsSchema = z.object({
  emailNewLead: z.boolean(),
  emailNewOffer: z.boolean(),
  emailListingUpdate: z.boolean(),
  emailWeeklyDigest: z.boolean(),
  marketingEmails: z.boolean(),
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(TEAM_ROLES).default("agent"),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(TEAM_ROLES),
});

export const updateBrandingSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: optionalHttpUrl,
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
  website: optionalHttpUrl,
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  socialFacebook: optionalHttpUrl,
  socialInstagram: optionalHttpUrl,
  socialTwitter: optionalHttpUrl,
  socialLinkedin: optionalHttpUrl,
});

export const onboardingSchema = z.object({
  agencyName: z.string().min(1, "Agency name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric with hyphens"),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  address: z.string().optional(),
  website: z.union([httpUrl, z.literal("")]).optional(),
});

export const pipelineStagesSchema = z
  .array(
    z.object({
      name: z.string().min(1).max(60),
      order: z.number().int().min(0),
    }),
  )
  .max(30);
