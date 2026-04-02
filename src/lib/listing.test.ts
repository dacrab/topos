import { Check, Waves } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  AMENITIES,
  getAmenityIcon,
  getAmenityLabel,
  PROPERTY_TYPES,
  parseListingData,
} from "./listing";

describe("listing utils", () => {
  it("exposes expected property types and amenities", () => {
    expect(PROPERTY_TYPES).toContain("apartment");
    expect(PROPERTY_TYPES).toContain("commercial");
    expect(AMENITIES).toContain("pool");
    expect(AMENITIES).toContain("security");
  });

  it("returns configured amenity icon and label", () => {
    expect(getAmenityIcon("pool")).toBe(Waves);
    expect(getAmenityLabel("pool")).toBe("Pool");
  });

  it("falls back safely for unknown amenities", () => {
    expect(getAmenityIcon("unknown")).toBe(Check);
    expect(getAmenityLabel("unknown")).toBe("unknown");
  });

  it("parses listing data with sensible empty fallbacks", () => {
    expect(parseListingData({ features: null, address: null })).toEqual({
      features: {},
      address: {},
    });
  });

  it("preserves provided feature and address objects", () => {
    const features = { beds: 2, amenities: ["parking"] };
    const address = { city: "Athens" };

    expect(parseListingData({ features, address })).toEqual({ features, address });
  });
});
