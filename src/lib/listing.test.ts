import { describe, expect, it } from "vitest";
import { AMENITIES, PROPERTY_TYPES } from "./listing";

describe("PROPERTY_TYPES & AMENITIES", () => {
  it("contains expected property types", () => {
    expect(PROPERTY_TYPES).toContain("apartment");
    expect(PROPERTY_TYPES).toContain("commercial");
    expect(PROPERTY_TYPES).toContain("villa");
    expect(PROPERTY_TYPES).toContain("land");
  });

  it("contains expected amenities", () => {
    expect(AMENITIES).toContain("pool");
    expect(AMENITIES).toContain("security");
    expect(AMENITIES).toContain("petFriendly");
    expect(AMENITIES).toContain("parking");
  });
});
