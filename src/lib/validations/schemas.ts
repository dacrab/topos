import { z } from "zod/v4";
import { PROPERTY_TYPES } from "@/lib/listing-constants";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive("Price must be positive"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  propertyType: z.enum(PROPERTY_TYPES).default("apartment"),
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
