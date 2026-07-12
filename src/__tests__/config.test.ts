import { describe, expect, it } from "vitest";
import {
  ADMIN_ROLES,
  ALLOWED_IMAGE_TYPES,
  AMENITIES,
  APPOINTMENT_TYPES,
  COMMISSION_TYPES,
  CONTACT_TYPES,
  CURRENCY,
  DEAL_STAGES,
  DEAL_STATUSES,
  DOCUMENT_TYPES,
  LISTING_STATUSES,
  MAX_FILE_SIZE,
  PLAN_IDS,
  PROPERTY_TYPES,
  RECURRENCE_OPTIONS,
  rootDomainWithoutPort,
  TEAM_ROLES,
} from "@/lib/config";
import { NON_OWNER_ROLES } from "@/lib/types";

describe("config constants", () => {
  it("rootDomainWithoutPort strips a trailing port", () => {
    expect(rootDomainWithoutPort()).toBe("localhost");
  });
  it("ADMIN_ROLES is a subset of TEAM_ROLES", () => {
    for (const role of ADMIN_ROLES) {
      expect(TEAM_ROLES).toContain(role);
    }
  });

  it("NON_OWNER_ROLES excludes owner", () => {
    expect(NON_OWNER_ROLES).not.toContain("owner");
    expect(NON_OWNER_ROLES).toEqual(["admin", "agent", "viewer"]);
  });

  it("CURRENCY has correct shape", () => {
    expect(CURRENCY).toEqual({ symbol: "€", code: "EUR" });
  });

  it("MAX_FILE_SIZE is 10MB", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("LISTING_STATUSES contains expected values", () => {
    expect(LISTING_STATUSES).toEqual(["DRAFT", "PUBLISHED", "ARCHIVED"]);
  });

  it("DEAL_STAGES contains pipeline stages", () => {
    expect(DEAL_STAGES).toContain("new");
    expect(DEAL_STAGES).toContain("closed_won");
    expect(DEAL_STAGES).toContain("closed_lost");
  });

  it("DEAL_STATUSES are active/completed/cancelled", () => {
    expect(DEAL_STATUSES).toEqual(["active", "completed", "cancelled"]);
  });

  it("CONTACT_TYPES contains expected values", () => {
    expect(CONTACT_TYPES).toContain("LEAD");
    expect(CONTACT_TYPES).toContain("CLIENT");
  });

  it("DOCUMENT_TYPES contains contract", () => {
    expect(DOCUMENT_TYPES).toContain("contract");
  });

  it("APPOINTMENT_TYPES are defined", () => {
    expect(APPOINTMENT_TYPES).toContain("viewing");
    expect(APPOINTMENT_TYPES).toContain("open_house");
  });

  it("COMMISSION_TYPES are defined", () => {
    expect(COMMISSION_TYPES).toContain("listing_side");
    expect(COMMISSION_TYPES).toContain("referral");
  });

  it("RECURRENCE_OPTIONS are defined", () => {
    expect(RECURRENCE_OPTIONS).toContain("weekly");
    expect(RECURRENCE_OPTIONS).toContain("monthly");
  });

  it("PROPERTY_TYPES are defined", () => {
    expect(PROPERTY_TYPES).toContain("apartment");
    expect(PROPERTY_TYPES).toContain("house");
    expect(PROPERTY_TYPES).toContain("commercial");
  });

  it("AMENITIES are defined", () => {
    expect(AMENITIES).toContain("parking");
    expect(AMENITIES).toContain("pool");
    expect(AMENITIES).toContain("ac");
  });

  it("ALLOWED_IMAGE_TYPES includes common formats", () => {
    expect(ALLOWED_IMAGE_TYPES).toContain("image/jpeg");
    expect(ALLOWED_IMAGE_TYPES).toContain("image/png");
    expect(ALLOWED_IMAGE_TYPES).toContain("image/webp");
  });

  it("PLAN_IDS includes free, pro, enterprise", () => {
    expect(PLAN_IDS).toEqual(["free", "pro", "enterprise"]);
  });
});
