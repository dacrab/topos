import { describe, expect, it } from "vitest";
import { getInitials } from "./utils";

describe("getInitials", () => {
  it("returns first two initials from a full name", () => {
    expect(getInitials("Alice Johnson", "a@b.com")).toBe("AJ");
  });

  it("returns single initial for single-word name", () => {
    expect(getInitials("Alice", "a@b.com")).toBe("A");
  });

  it("uppercases initials", () => {
    expect(getInitials("john doe", "j@d.com")).toBe("JD");
  });

  it("slices to max 2 chars for multi-word names", () => {
    expect(getInitials("Alice Bob Charlie", "a@b.com")).toBe("AB");
  });

  it("falls back to first char of email when name is null", () => {
    expect(getInitials(null, "alice@example.com")).toBe("A");
  });

  it("falls back to first char of email when name is undefined", () => {
    expect(getInitials(undefined, "bob@example.com")).toBe("B");
  });

  it("falls back to first char of email when name is empty string", () => {
    expect(getInitials("", "carol@example.com")).toBe("C");
  });

  it("uppercases the email fallback", () => {
    expect(getInitials(null, "zara@example.com")).toBe("Z");
  });

  it("returns ? when email is empty", () => {
    expect(getInitials(null, "")).toBe("?");
  });
});
