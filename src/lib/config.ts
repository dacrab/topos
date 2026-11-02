/**
 * Application-wide constants.
 *
 * Everything here is static configuration. User- and tenant-scoped data lives
 * in the database; secrets are read from the environment only where they are
 * used (see `lib/r2.ts`, `lib/polar.ts`, `lib/email.ts`).
 */

export const APP_CONFIG = {
  name: "Topos",
  domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
} as const;

export function rootDomainWithoutPort(): string {
  return APP_CONFIG.domain.replace(/:\d+$/, "");
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? `https://${rootDomainWithoutPort()}`;
}

// ── Uploads ────────────────────────────────────────────────────────────────
//
// Uploads land on a public bucket URL, so anything a browser renders as markup
// or executes (text/html, image/svg+xml) is deliberately excluded.

export const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_DOCUMENT_TYPES: readonly string[] = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/csv",
  "text/plain",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Domain enums ───────────────────────────────────────────────────────────
// Single source of truth for status, role, and type values.

export const LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const CONTACT_TYPES = ["LEAD", "CLIENT", "VENDOR", "OTHER"] as const;

export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
export const ADMIN_ROLES: TeamRole[] = ["owner", "admin"];

export function isTeamRole(role: string | undefined): role is TeamRole {
  return role !== undefined && (TEAM_ROLES as readonly string[]).includes(role);
}

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

// ── Limits ─────────────────────────────────────────────────────────────────

export const CURRENCY = { symbol: "€", code: "EUR" } as const;

export const INQUIRY_RATE_LIMIT = 5;
export const INQUIRY_RATE_WINDOW = 60_000; // 1 minute
