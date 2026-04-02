import { Building2, DollarSign, FileText, Home, UserPlus } from "lucide-react";
import { describe, expect, it } from "vitest";
import { getActivityIcon, getActivityLink } from "./activity";

describe("activity utils", () => {
  it.each([
    ["LISTING_CREATED", Building2, "/listings"],
    ["NEW_LEAD", UserPlus, "/contacts"],
    ["OFFER_RECEIVED", DollarSign, "/transactions"],
    ["CONTACT_ADDED", UserPlus, "/contacts"],
    ["DOCUMENT_ADDED", FileText, "/dashboard"],
  ])("maps %s to the right icon and link", (type, icon, link) => {
    expect(getActivityIcon(type)).toBe(icon);
    expect(getActivityLink(type)).toBe(link);
  });

  it("falls back to home/dashboard for unknown activity types", () => {
    expect(getActivityIcon("NOPE")).toBe(Home);
    expect(getActivityLink("NOPE")).toBe("/dashboard");
  });
});
