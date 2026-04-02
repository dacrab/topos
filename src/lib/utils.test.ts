import { describe, expect, it } from "vitest";
import { cn, getInitials } from "./utils";

describe("cn", () => {
  it("merges and deduplicates Tailwind classes", () => {
    expect(cn("px-2 py-2", "px-4", false && "hidden", undefined, "text-sm")).toBe(
      "py-2 px-4 text-sm",
    );
  });
});

describe("getInitials", () => {
  it.each([
    ["Alice Johnson", "a@b.com", "AJ"],
    ["Alice", "a@b.com", "A"],
    ["john doe", "j@d.com", "JD"],
    ["Alice Bob Charlie", "a@b.com", "AB"],
  ])("returns expected initials for %s", (name, email, expected) => {
    expect(getInitials(name, email)).toBe(expected);
  });

  it.each([
    [null, "alice@example.com", "A"],
    [undefined, "bob@example.com", "B"],
    ["", "carol@example.com", "C"],
    [null, "zara@example.com", "Z"],
    [null, "", "?"],
  ])("falls back correctly for name=%s email=%s", (name, email, expected) => {
    expect(getInitials(name, email)).toBe(expected);
  });
});
