import { describe, expect, it } from "vitest";
import { parseFormData } from "@/lib/form-parser";

function createForm(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.append(k, v);
  return fd;
}

describe("parseFormData", () => {
  describe("get", () => {
    it("returns string value", () => {
      const { get } = parseFormData(createForm({ name: "John" }));
      expect(get("name")).toBe("John");
    });

    it("trims whitespace", () => {
      const { get } = parseFormData(createForm({ name: "  John  " }));
      expect(get("name")).toBe("John");
    });

    it("returns null for missing key", () => {
      const { get } = parseFormData(new FormData());
      expect(get("missing")).toBeNull();
    });

    it("returns null for empty string", () => {
      const { get } = parseFormData(createForm({ name: "" }));
      expect(get("name")).toBeNull();
    });

    it("returns null for whitespace-only string", () => {
      const { get } = parseFormData(createForm({ name: "   " }));
      expect(get("name")).toBeNull();
    });
  });

  describe("getNum", () => {
    it("parses numeric string", () => {
      const { getNum } = parseFormData(createForm({ n: "42" }));
      expect(getNum("n")).toBe(42);
    });

    it("parses decimal string", () => {
      const { getNum } = parseFormData(createForm({ n: "3.14" }));
      expect(getNum("n")).toBe(3.14);
    });

    it("returns null for missing key", () => {
      const { getNum } = parseFormData(new FormData());
      expect(getNum("missing")).toBeNull();
    });

    it("returns null for non-numeric string", () => {
      const { getNum } = parseFormData(createForm({ n: "abc" }));
      expect(getNum("n")).toBeNull();
    });
  });

  describe("getBool", () => {
    it("returns true for 'on'", () => {
      const { getBool } = parseFormData(createForm({ active: "on" }));
      expect(getBool("active")).toBe(true);
    });

    it("returns false for missing key", () => {
      const { getBool } = parseFormData(new FormData());
      expect(getBool("missing")).toBe(false);
    });

    it("returns false for arbitrary value", () => {
      const { getBool } = parseFormData(createForm({ x: "yes" }));
      expect(getBool("x")).toBe(false);
    });
  });

  describe("getJson", () => {
    it("parses valid JSON array", () => {
      const { getJson } = parseFormData(createForm({ data: '["a","b"]' }));
      expect(getJson("data", [])).toEqual(["a", "b"]);
    });

    it("parses valid JSON object", () => {
      const { getJson } = parseFormData(createForm({ data: '{"key":"val"}' }));
      expect(getJson("data", {})).toEqual({ key: "val" });
    });

    it("returns fallback for invalid JSON", () => {
      const { getJson } = parseFormData(createForm({ data: "not json" }));
      expect(getJson("data", [])).toEqual([]);
    });

    it("returns fallback for missing key", () => {
      const { getJson } = parseFormData(new FormData());
      expect(getJson("missing", { default: true })).toEqual({ default: true });
    });

    it("returns fallback for empty string", () => {
      const { getJson } = parseFormData(createForm({ data: "" }));
      expect(getJson("data", 42)).toBe(42);
    });
  });
});
