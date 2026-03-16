import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatPrice, formatTime, truncateId } from "./format";

describe("formatCurrency", () => {
  it("formats values under 1k as plain euros", () => {
    expect(formatCurrency(0)).toBe("€0");
    expect(formatCurrency(500)).toBe("€500");
    expect(formatCurrency(999)).toBe("€999");
  });

  it("formats values 1k+ with k abbreviation", () => {
    expect(formatCurrency(1000)).toBe("€1k");
    expect(formatCurrency(1500)).toBe("€2k");
    expect(formatCurrency(250000)).toBe("€250k");
    expect(formatCurrency(999999)).toBe("€1000k");
  });

  it("formats values 1M+ with M abbreviation", () => {
    expect(formatCurrency(1_000_000)).toBe("€1.0M");
    expect(formatCurrency(2_500_000)).toBe("€2.5M");
    expect(formatCurrency(10_000_000)).toBe("€10.0M");
  });
});

describe("formatPrice", () => {
  it("formats with euro symbol, no abbreviation", () => {
    expect(formatPrice(0)).toBe("€0");
    expect(formatPrice(1000)).toContain("€");
    expect(formatPrice(1000)).toContain("1");
    // Should not abbreviate
    expect(formatPrice(1_000_000)).not.toContain("M");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats a date string", () => {
    const result = formatDate("2024-06-01");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatTime", () => {
  it("returns HH:MM format string", () => {
    const date = new Date("2024-01-15T14:30:00");
    const result = formatTime(date);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("accepts date strings", () => {
    const result = formatTime("2024-01-15T09:05:00");
    expect(typeof result).toBe("string");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("truncateId", () => {
  it("returns first 8 chars + ellipsis", () => {
    expect(truncateId("abcdefghijklmnop")).toBe("abcdefgh...");
  });

  it("handles IDs shorter than 8 chars", () => {
    expect(truncateId("abc")).toBe("abc...");
  });

  it("handles UUIDs", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(truncateId(uuid)).toBe("550e8400...");
  });
});
