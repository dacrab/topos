import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatTime, truncateId } from "./format";

describe("formatCurrency", () => {
  it("formats values without abbreviation by default", () => {
    expect(formatCurrency(0)).toBe("€0");
    expect(formatCurrency(500)).toBe("€500");
    expect(formatCurrency(1000)).toBe("€1,000");
    expect(formatCurrency(250000)).toBe("€250,000");
  });

  it("formats with abbreviation when enabled", () => {
    expect(formatCurrency(1000, true)).toBe("€1k");
    expect(formatCurrency(1500, true)).toBe("€2k");
    expect(formatCurrency(1_000_000, true)).toBe("€1.0M");
    expect(formatCurrency(2_500_000, true)).toBe("€2.5M");
  });
});

describe("formatDate", () => {
  it("formats a Date object to a non-empty locale string containing the year", () => {
    expect(formatDate(new Date("2024-01-15"))).toContain("2024");
  });

  it("accepts a date string", () => {
    expect(formatDate("2024-06-01")).toContain("2024");
  });

  it("produces consistent output from Date and string for the same day", () => {
    expect(formatDate(new Date("2024-03-20"))).toBe(formatDate("2024-03-20"));
  });
});

describe("formatTime", () => {
  it("returns HH:MM format string", () => {
    expect(formatTime(new Date("2024-01-15T14:30:00"))).toMatch(/\d{1,2}:\d{2}/);
  });

  it("accepts date strings", () => {
    expect(formatTime("2024-01-15T09:05:00")).toMatch(/\d{1,2}:\d{2}/);
  });

  it("pads minutes to two digits", () => {
    expect(formatTime(new Date("2024-01-15T09:05:00"))).toContain("05");
  });

  it("returns different times for different hours", () => {
    const t1 = formatTime(new Date("2024-01-15T09:00:00"));
    const t2 = formatTime(new Date("2024-01-15T23:00:00"));
    expect(t1).not.toBe(t2);
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
    expect(truncateId("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400...");
  });

  it("always appends ellipsis regardless of length", () => {
    expect(truncateId("x")).toMatch(/\.\.\.$/);
    expect(truncateId("abcdefghij")).toMatch(/\.\.\.$/);
  });
});
