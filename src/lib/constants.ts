// Role constants
export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
export const NON_OWNER_ROLES = TEAM_ROLES.filter((r) => r !== "owner");

// Status constants
export const LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CONTACT_TYPES = ["LEAD", "CLIENT", "VENDOR", "OTHER"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const SUBSCRIPTION_PLANS = ["free", "pro", "enterprise"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];
