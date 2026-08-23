import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/schema", () => ({
  listing: { __t: "listing" },
  teamMember: { __t: "teamMember" },
  tenant: { __t: "tenant" },
}));

let tenantRows: unknown[] = [];
let resourceRows: unknown[] = [];

function chainFor(table: { __t: string }) {
  const rows = table.__t === "tenant" ? tenantRows : resourceRows;
  const p = Promise.resolve(rows) as Promise<unknown[]> & {
    limit: () => Promise<unknown[]>;
    offset: () => Promise<unknown[]>;
  };
  p.limit = () => Promise.resolve(rows);
  p.offset = () => Promise.resolve(rows);
  return p;
}

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: (table: { __t: string }) => ({
        where: () => chainFor(table),
      }),
    }),
  },
}));

describe("getPlan", () => {
  it("returns the matching plan", async () => {
    const { getPlan } = await import("@/lib/plans");
    expect(getPlan("free").id).toBe("free");
    expect(getPlan("pro").id).toBe("pro");
    expect(getPlan("enterprise").id).toBe("enterprise");
  });

  it("falls back to the free plan for unknown ids", async () => {
    const { getPlan } = await import("@/lib/plans");
    expect(getPlan("does-not-exist").id).toBe("free");
    expect(getPlan("").id).toBe("free");
  });
});

describe("checkPlanLimit", () => {
  it("returns null when usage is below the free listing limit", async () => {
    const { checkPlanLimit } = await import("@/lib/plans");
    tenantRows = [{ plan: "free" }];
    resourceRows = [{ count: 3 }];
    expect(await checkPlanLimit("t1", "listings")).toBeNull();
  });

  it("returns limit details when usage reaches the free listing limit", async () => {
    const { checkPlanLimit } = await import("@/lib/plans");
    tenantRows = [{ plan: "free" }];
    resourceRows = [{ count: 5 }];
    expect(await checkPlanLimit("t1", "listings")).toEqual({
      planId: "free",
      planNameKey: "freeName",
      limit: 5,
      resource: "listings",
    });
  });

  it("returns null for the unlimited pro plan regardless of usage", async () => {
    const { checkPlanLimit } = await import("@/lib/plans");
    tenantRows = [{ plan: "pro" }];
    resourceRows = [{ count: 9999 }];
    expect(await checkPlanLimit("t1", "listings")).toBeNull();
  });

  it("returns null for unlimited enterprise team members", async () => {
    const { checkPlanLimit } = await import("@/lib/plans");
    tenantRows = [{ plan: "enterprise" }];
    resourceRows = [{ count: 100 }];
    expect(await checkPlanLimit("t1", "teamMembers")).toBeNull();
  });

  it("returns limit details when over the free team member limit", async () => {
    const { checkPlanLimit } = await import("@/lib/plans");
    tenantRows = [{ plan: "free" }];
    resourceRows = [{ count: 2 }];
    expect(await checkPlanLimit("t1", "teamMembers")).toMatchObject({
      planId: "free",
      limit: 1,
      resource: "teamMembers",
    });
  });

  it("falls back to the free plan when the tenant has no plan set", async () => {
    const { checkPlanLimit } = await import("@/lib/plans");
    tenantRows = [];
    resourceRows = [{ count: 6 }];
    expect(await checkPlanLimit("t1", "listings")).toMatchObject({ planId: "free", limit: 5 });
  });
});
