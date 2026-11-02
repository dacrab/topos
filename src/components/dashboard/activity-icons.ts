import { Building2, DollarSign, FileText, type LucideIcon, UserPlus } from "lucide-react";
import type { ActivityType } from "@/lib/activity";

export const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  LISTING_CREATED: Building2,
  INQUIRY: UserPlus,
  DEAL_CREATED: DollarSign,
  DOCUMENT_ADDED: FileText,
};
