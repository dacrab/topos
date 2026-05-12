export const APP_CONFIG = {
  name: "Topos",
  tagline: "Modern Real Estate Brokerage Platform",
  domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  demoTenant: { slug: "demo", name: "Demo Brokerage" },
  defaultTenantName: "Personal Brokerage",
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/listings",
  "/contacts",
  "/transactions",
  "/settings",
  "/onboarding",
  "/deals",
  "/commissions",
  "/documents",
  "/appointments",
  "/activity",
] as const;

// Domain enums — single source of truth for all status/role/type values
export const LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CONTACT_TYPES = ["LEAD", "CLIENT", "VENDOR", "OTHER"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
export const ADMIN_ROLES: TeamRole[] = ["owner", "admin"];

export const PLAN_IDS = ["free", "pro", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const LISTING_TYPES = ["sale", "rent"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const CURRENCY = { symbol: "€", code: "EUR" } as const;

export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "penthouse",
  "studio",
  "land",
  "commercial",
] as const;

export const AMENITIES = [
  "parking",
  "pool",
  "garden",
  "balcony",
  "elevator",
  "ac",
  "heating",
  "furnished",
  "petFriendly",
  "security",
  "gym",
  "storage",
] as const;

export const DEAL_STAGES = [
  "new",
  "contacted",
  "viewing",
  "offer",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_STATUSES = ["active", "completed", "cancelled"] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export const COMMISSION_TYPES = ["listing_side", "buying_side", "referral", "bonus"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

export const COMMISSION_STATUSES = ["pending", "paid", "cancelled"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "contract",
  "disclosure",
  "inspection",
  "appraisal",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const APPOINTMENT_TYPES = ["viewing", "meeting", "inspection", "open_house"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const RECURRENCE_OPTIONS = ["daily", "weekly", "biweekly", "monthly"] as const;
export type RecurrenceOption = (typeof RECURRENCE_OPTIONS)[number];

export const CONTACT_SOURCES = ["website", "referral", "manual", "import", "advertising"] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number];

export const LEAD_ASSIGNMENT_METHODS = ["manual", "round_robin", "area_based"] as const;
export type LeadAssignmentMethod = (typeof LEAD_ASSIGNMENT_METHODS)[number];
