import { Bell, Building2, DollarSign, FileText, Home, UserPlus } from "lucide-react";

export const ACTIVITY_TYPES = [
  "LISTING_CREATED",
  "NEW_LEAD",
  "OFFER_RECEIVED",
  "CONTACT_ADDED",
  "DOCUMENT_ADDED",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof Bell; link: string }
> = {
  LISTING_CREATED: { icon: Building2, link: "/listings" },
  NEW_LEAD: { icon: UserPlus, link: "/contacts" },
  OFFER_RECEIVED: { icon: DollarSign, link: "/transactions" },
  CONTACT_ADDED: { icon: UserPlus, link: "/contacts" },
  DOCUMENT_ADDED: { icon: FileText, link: "/dashboard" },
};

export function getActivityIcon(type: string) {
  return ACTIVITY_CONFIG[type as ActivityType]?.icon || Home;
}

export function getActivityLink(type: string) {
  return ACTIVITY_CONFIG[type as ActivityType]?.link || "/dashboard";
}
