/**
 * Maps stored enum values to their translation keys.
 *
 * Database values are stable snake_case/camelCase identifiers; the labels
 * shown to people live in the locale files. Keeping the mapping here avoids
 * scattering `.replace(/_/g, " ")` calls through the UI.
 */

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  LISTING_CREATED: "activityListingCreated",
  INQUIRY: "activityInquiry",
  DEAL_CREATED: "activityDealCreated",
  DOCUMENT_ADDED: "activityDocumentAdded",
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  viewing: "typeViewing",
  meeting: "typeMeeting",
  inspection: "typeInspection",
  open_house: "typeOpenHouse",
};

export const RECURRENCE_LABELS: Record<string, string> = {
  daily: "recurrenceDaily",
  weekly: "recurrenceWeekly",
  biweekly: "recurrenceBiweekly",
  monthly: "recurrenceMonthly",
};

export const COMMISSION_TYPE_LABELS: Record<string, string> = {
  listing_side: "typeListingSide",
  buying_side: "typeBuyingSide",
  referral: "typeReferral",
  bonus: "typeBonus",
};

export const COMMISSION_STATUS_LABELS: Record<string, string> = {
  pending: "statusPending",
  paid: "statusPaid",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: "typeContract",
  disclosure: "typeDisclosure",
  inspection: "typeInspection",
  appraisal: "typeAppraisal",
  other: "typeOther",
};

export function labelKey(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}
