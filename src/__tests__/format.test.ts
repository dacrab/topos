import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats with euro symbol", () => {
    expect(formatCurrency(1000)).toBe("€1,000");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("€0");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(1_000_000)).toBe("€1,000,000");
  });

  it("abbreviates millions", () => {
    expect(formatCurrency(2_500_000, true)).toBe("€2.5M");
  });

  it("abbreviates thousands", () => {
    expect(formatCurrency(1400, true)).toBe("€1k");
  });

  it("does not abbreviate under 1000", () => {
    expect(formatCurrency(500, true)).toBe("€500");
  });

  it("rounds million abbreviation to one decimal", () => {
    expect(formatCurrency(3_450_000, true)).toBe("€3.5M");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const d = new Date(2024, 0, 15);
    expect(formatDate(d)).toBe("1/15/2024");
  });

  it("formats a date string", () => {
    expect(formatDate("2024-06-01")).toBe("6/1/2024");
  });

  it("accepts a locale parameter", () => {
    const d = new Date(2024, 0, 15);
    expect(formatDate(d, "de-DE")).toBe("15.1.2024");
  });

  it("returns an em dash for invalid dates", () => {
    expect(formatDate("not-a-date")).toBe("—");
    expect(formatDate(new Date(NaN))).toBe("—");
  });
});

describe("formatTime", () => {
  it("formats a Date object", () => {
    const d = new Date(2024, 0, 15, 14, 30);
    expect(formatTime(d)).toBe("02:30 PM");
  });

  it("formats a date string", () => {
    expect(formatTime("2024-06-01T09:15:00")).toBe("09:15 AM");
  });

  it("accepts a locale parameter", () => {
    const d = new Date(2024, 0, 15, 14, 30);
    expect(formatTime(d, "de-DE")).toBe("14:30");
  });

  it("returns an em dash for invalid dates", () => {
    expect(formatTime("not-a-date")).toBe("—");
  });
});
