import { describe, expect, it } from "vitest";
import {
  AMENITIES,
  getLabelKey,
  getListingStatusLabelKey,
  PROPERTY_TYPES,
  parseListingData,
} from "./listing";

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

describe("getLabelKey", () => {
  it("produces correct i18n keys with capitalized first letter", () => {
    expect(getLabelKey("amenity", "pool")).toBe("amenityPool");
    expect(getLabelKey("amenity", "petFriendly")).toBe("amenityPetFriendly");
    expect(getLabelKey("propertyType", "apartment")).toBe("propertyTypeApartment");
    expect(getLabelKey("propertyType", "villa")).toBe("propertyTypeVilla");
  });

  it("handles single-char values", () => {
    expect(getLabelKey("x", "a")).toBe("xA");
  });
});

describe("getListingStatusLabelKey", () => {
  it("returns 'published' for PUBLISHED status", () => {
    expect(getListingStatusLabelKey("PUBLISHED")).toBe("published");
  });

  it("returns 'draft' for any other status including DRAFT", () => {
    expect(getListingStatusLabelKey("DRAFT")).toBe("draft");
    expect(getListingStatusLabelKey("ARCHIVED")).toBe("draft");
    expect(getListingStatusLabelKey("")).toBe("draft");
  });
});

describe("parseListingData", () => {
  it("returns empty objects when features and address are null", () => {
    expect(parseListingData({ features: null, address: null })).toEqual({
      features: {},
      address: {},
    });
  });

  it("returns empty objects when features and address are undefined", () => {
    expect(parseListingData({ features: undefined, address: undefined })).toEqual({
      features: {},
      address: {},
    });
  });

  it("preserves provided feature and address objects", () => {
    const features = { beds: 2, amenities: ["parking"] };
    const address = { city: "Athens" };
    expect(parseListingData({ features, address })).toEqual({ features, address });
  });

  it("handles partial feature objects", () => {
    const result = parseListingData({ features: { beds: 3 }, address: {} });
    expect(result.features).toEqual({ beds: 3 });
    expect(result.address).toEqual({});
  });
});
