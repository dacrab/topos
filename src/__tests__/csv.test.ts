import { describe, expect, it } from "vitest";
import { parseContactsCsv } from "@/lib/csv";

describe("parseContactsCsv", () => {
  it("strips the BOM and normalizes headers", () => {
    const records = parseContactsCsv(
      "\uFEFFFirst Name,Last Name,Email\r\nAda,Lovelace,ada@example.com",
    );

    expect(records).toEqual([
      { first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" },
    ]);
  });

  it("keeps newlines inside quoted fields", () => {
    const records = parseContactsCsv('First Name,Source\r\nAda,"line one\nline two"');

    expect(records[0]?.source).toBe("line one\nline two");
  });

  it("handles escaped quotes", () => {
    const records = parseContactsCsv('First Name,Source\r\nAda,"said ""hello"""');

    expect(records[0]?.source).toBe('said "hello"');
  });
});
