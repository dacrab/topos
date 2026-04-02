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

describe("PLANS shape", () => {
  it("has 3 plans: free (limited), pro (recommended/unlimited), enterprise (unlimited)", () => {
    expect(PLANS).toHaveLength(3);
    expect(PLANS.filter((p) => p.recommended).map((p) => p.id)).toEqual(["pro"]);
    expect(PLANS.find((p) => p.id === "free")?.limits.listings).toBeGreaterThan(0);
    expect(PLANS.filter((p) => p.limits.listings === -1).map((p) => p.id)).toEqual([
      "pro",
      "enterprise",
    ]);
  });
});

describe("MARKETING_PLANS shape", () => {
  it("has 3 plans, growth is featured, each has 3 features", () => {
    expect(MARKETING_PLANS).toHaveLength(3);
    expect(MARKETING_PLANS.filter((p) => p.featured).map((p) => p.nameKey)).toEqual(["growth"]);
    for (const plan of MARKETING_PLANS) expect(plan.features).toHaveLength(3);
  });
});
