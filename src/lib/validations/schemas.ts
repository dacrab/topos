import { z } from "zod/v4";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive("Price must be positive"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  propertyType: z
    .enum(["apartment", "house", "villa", "land", "commercial", "other"])
    .default("apartment"),
  listingType: z.enum(["sale", "rent"]).default("sale"),
  beds: z.coerce.number().int().min(0).optional(),
  baths: z.coerce.number().int().min(0).optional(),
  sqft: z.coerce.number().int().min(0).optional(),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
});

  name: z.string().min(1, "Name is required").max(100),
  image: z.string().url().optional().or(z.literal("")),
});

  name: z.string().min(1, "Company name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  customDomain: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  companyEmail: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().max(300).optional(),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialTwitter: z.string().url().optional().or(z.literal("")),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
});

  name: z.string().min(1).max(100),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primary: z.string().max(50).optional(),
  accent: z.string().max(50).optional(),
  radius: z.string().max(20).optional(),
});

  emailNewLead: z.coerce.boolean().default(true),
  emailNewListing: z.coerce.boolean().default(true),
  emailWeeklyReport: z.coerce.boolean().default(false),
  pushNewLead: z.coerce.boolean().default(true),
  pushNewListing: z.coerce.boolean().default(false),
});


  schema: z.ZodSchema<T>,
  formData: FormData,
): { success: true; data: T } | { success: false; error: string } {
  const raw = Object.fromEntries(formData.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message ?? "Validation failed",
    };
  }

  return { success: true, data: result.data };
}
