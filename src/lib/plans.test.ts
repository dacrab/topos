import { describe, expect, it } from "vitest";
import { getPlan, PLANS } from "./plans";

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
  it("has 3 plans with correct structure", () => {
    expect(PLANS).toHaveLength(3);
    expect(PLANS.map((p) => p.id)).toEqual(["free", "pro", "enterprise"]);
  });

  it("has pro plan as recommended", () => {
    const recommended = PLANS.filter((p) => p.recommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0]?.id).toBe("pro");
  });

  it("has correct limits", () => {
    expect(PLANS.find((p) => p.id === "free")?.limits.listings).toBe(5);
    expect(PLANS.find((p) => p.id === "pro")?.limits.listings).toBe(-1);
    expect(PLANS.find((p) => p.id === "enterprise")?.limits.teamMembers).toBe(-1);
  });
});
