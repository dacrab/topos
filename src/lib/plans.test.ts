import { describe, expect, it } from "vitest";
import { getPlan, MARKETING_PLANS, PLANS } from "./plans";

describe("getPlan", () => {
  it("returns the free plan", () => {
    const plan = getPlan("free");
    expect(plan.id).toBe("free");
    expect(plan.price).toBe(0);
  });

  it("returns the pro plan", () => {
    const plan = getPlan("pro");
    expect(plan.id).toBe("pro");
    expect(plan.price).toBe(29);
    expect(plan.limits.listings).toBe(-1);
  });

  it("returns the enterprise plan", () => {
    const plan = getPlan("enterprise");
    expect(plan.id).toBe("enterprise");
    expect(plan.price).toBe(99);
    expect(plan.limits.teamMembers).toBe(-1);
  });

  it("falls back to free plan for unknown id", () => {
    const plan = getPlan("nonexistent");
    expect(plan.id).toBe("free");
  });

  it("falls back to free plan for empty string", () => {
    const plan = getPlan("");
    expect(plan.id).toBe("free");
  });
});

describe("PLANS", () => {
  it("has exactly 3 plans", () => {
    expect(PLANS).toHaveLength(3);
  });

  it("marks only pro as recommended", () => {
    const recommended = PLANS.filter((p) => p.recommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0]?.id).toBe("pro");
  });

  it("free plan has listing limit", () => {
    const free = PLANS.find((p) => p.id === "free");
    expect(free?.limits.listings).toBeGreaterThan(0);
  });

  it("pro and enterprise have unlimited listings (-1)", () => {
    const unlimited = PLANS.filter((p) => p.limits.listings === -1);
    expect(unlimited.map((p) => p.id)).toContain("pro");
    expect(unlimited.map((p) => p.id)).toContain("enterprise");
  });
});

describe("MARKETING_PLANS", () => {
  it("has exactly 3 plans", () => {
    expect(MARKETING_PLANS).toHaveLength(3);
  });

  it("marks only growth as featured", () => {
    const featured = MARKETING_PLANS.filter((p) => p.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0]?.nameKey).toBe("growth");
  });

  it("each plan has 3 feature keys", () => {
    for (const plan of MARKETING_PLANS) {
      expect(plan.features).toHaveLength(3);
    }
  });
});
