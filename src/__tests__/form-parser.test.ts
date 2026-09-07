import { describe, expect, it } from "vitest";
import { z } from "zod";
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

    it("parses zero as a number", () => {
      const { getNum } = parseFormData(createForm({ n: "0" }));
      expect(getNum("n")).toBe(0);
    });
  });

  describe("getBool", () => {
    it.each(["on", "true", "1"])("returns true for %s", (val) => {
      const { getBool } = parseFormData(createForm({ active: val }));
      expect(getBool("active")).toBe(true);
    });

    it("returns false for missing key", () => {
      const { getBool } = parseFormData(new FormData());
      expect(getBool("missing")).toBe(false);
    });

    it.each(["yes", "false", "0", "off", ""])("returns false for %s", (val) => {
      const { getBool } = parseFormData(createForm({ x: val }));
      expect(getBool("x")).toBe(false);
    });
  });

  describe("getJson", () => {
    it("parses valid JSON array", () => {
      const { getJson } = parseFormData(createForm({ data: '["a","b"]' }));
      expect(getJson("data", [], z.array(z.string()))).toEqual(["a", "b"]);
    });

    it("parses valid JSON object", () => {
      const { getJson } = parseFormData(createForm({ data: '{"key":"val"}' }));
      expect(getJson("data", {}, z.record(z.string(), z.string()))).toEqual({ key: "val" });
    });

    it("returns fallback for invalid JSON", () => {
      const { getJson } = parseFormData(createForm({ data: "not json" }));
      expect(getJson("data", [], z.array(z.string()))).toEqual([]);
    });

    it("returns fallback for JSON not matching the schema", () => {
      const { getJson } = parseFormData(createForm({ data: '["a", 5]' }));
      expect(getJson("data", [], z.array(z.string()))).toEqual([]);
    });

    it("returns fallback for missing key", () => {
      const { getJson } = parseFormData(new FormData());
      expect(getJson("missing", { default: true }, z.record(z.string(), z.boolean()))).toEqual({
        default: true,
      });
    });

    it("returns fallback for empty string", () => {
      const { getJson } = parseFormData(createForm({ data: "" }));
      expect(getJson("data", 42, z.number())).toBe(42);
    });
  });
});
