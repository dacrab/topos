import { describe, expect, it } from "vitest";
import { cn, getInitials } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
  });

  it("handles conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles undefined/null values", () => {
    expect(cn("px-2", undefined, null, "py-2")).toBe("px-2 py-2");
  });
});

describe("getInitials", () => {
  it("returns initials from name", () => {
    expect(getInitials("John Doe", "john@example.com")).toBe("JD");
  });

  it("falls back to email first char when name is null", () => {
    expect(getInitials(null, "john@example.com")).toBe("J");
  });

  it("limits to 2 characters", () => {
    expect(getInitials("John Michael Doe", "j@x.com")).toBe("JM");
  });
});
