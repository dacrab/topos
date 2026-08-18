export const APP_CONFIG = {
  name: "Topos",
  tagline: "The Cycladic Art of Real Estate",
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

// Domain enums — single source of truth for all status/role/type values
export const LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CONTACT_TYPES = ["LEAD", "CLIENT", "VENDOR", "OTHER"] as const;

export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
export const ADMIN_ROLES: TeamRole[] = ["owner", "admin"];

export function isTeamRole(role: string | undefined): role is TeamRole {
  return role !== undefined && (TEAM_ROLES as readonly string[]).includes(role);
}

export const PLAN_IDS = ["free", "pro", "enterprise"] as const;

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

export const DEAL_STATUSES = ["active", "completed", "cancelled"] as const;

export const COMMISSION_TYPES = ["listing_side", "buying_side", "referral", "bonus"] as const;

export const DOCUMENT_TYPES = [
  "contract",
  "disclosure",
  "inspection",
  "appraisal",
  "other",
] as const;

export const APPOINTMENT_TYPES = ["viewing", "meeting", "inspection", "open_house"] as const;

export const RECURRENCE_OPTIONS = ["daily", "weekly", "biweekly", "monthly"] as const;

export const INQUIRY_RATE_LIMIT = 5;
export const INQUIRY_RATE_WINDOW = 60_000; // 1 minute

export function rootDomainWithoutPort(): string {
  return APP_CONFIG.domain.replace(/:\d+$/, "");
}

export const POLAR_PRODUCT_IDS = {
  pro: process.env.POLAR_PRODUCT_ID_PRO ?? "",
  enterprise: process.env.POLAR_PRODUCT_ID_ENTERPRISE ?? "",
} as const;

export const WEBHOOK_SIGNATURE_MAX_AGE_SECONDS = 300;
export const SUBSCRIPTION_PERIOD_DAYS = 30;
