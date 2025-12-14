import {
  Car,
  Check,
  Dumbbell,
  Fence,
  PawPrint,
  ShieldCheck,
  Snowflake,
  Sofa,
  TreePine,
  Warehouse,
  Waves,
  Zap,
} from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  AMENITIES,
  getAmenityIcon,
  getAmenityLabel,
} from "@/lib/listing-constants";

const expectedConfig: Record<string, { icon: unknown; label: string }> = {
  parking: { icon: Car, label: "Parking" },
  pool: { icon: Waves, label: "Pool" },
  garden: { icon: TreePine, label: "Garden" },
  balcony: { icon: Fence, label: "Balcony" },
  elevator: { icon: Zap, label: "Elevator" },
  ac: { icon: Snowflake, label: "Air Conditioning" },
  heating: { icon: Zap, label: "Heating" },
  furnished: { icon: Sofa, label: "Furnished" },
  petFriendly: { icon: PawPrint, label: "Pet Friendly" },
  security: { icon: ShieldCheck, label: "Security" },
  gym: { icon: Dumbbell, label: "Gym" },
  storage: { icon: Warehouse, label: "Storage" },
};

describe("listing-constants", () => {
  it("exposes a stable amenity configuration for all known amenities", () => {
    for (const amenity of AMENITIES) {
      const icon = getAmenityIcon(amenity);
      const label = getAmenityLabel(amenity);

      const expected = expectedConfig[amenity];
      expect(expected, `Unexpected amenity key: ${amenity}`).toBeDefined();
      expect(icon).toBe(expected.icon);
      expect(label).toBe(expected.label);
    }
  });

  it("falls back to a generic icon and original key for unknown amenities", () => {
    const unknownKey = "rooftopGarden";

    const icon = getAmenityIcon(unknownKey);
    const label = getAmenityLabel(unknownKey);

    expect(icon).toBe(Check);
    expect(label).toBe(unknownKey);
  });
});
