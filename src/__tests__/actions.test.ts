import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (ns: string) => {
    const dicts: Record<string, Record<string, string>> = {
      Actions: {
        listingCreated: "Listing created successfully",
        listingCreateFailed: "Failed to create listing",
      },
      Billing: {
        freeName: "Free",
        listingLimit: "Your {plan} plan allows a maximum of {limit} listings. Upgrade to add more.",
      },
    };
    const table = dicts[ns] ?? {};
    return (key: string, params?: Record<string, unknown>) => {
      let out = table[key] ?? key;
      for (const [k, v] of Object.entries(params ?? {})) out = out.replaceAll(`{${k}}`, String(v));
      return out;
    };
  }),
}));
vi.mock("@/lib/webhook", () => ({ dispatchWebhook: vi.fn(async () => undefined) }));
vi.mock("@/lib/activity", () => ({
  checkRefs: vi.fn(async () => null),
  logActivity: vi.fn(async () => undefined),
  logAudit: vi.fn(async () => undefined),
}));

const ctx = {
  userId: "user-1",
  tenantId: "tenant-1",
  tenant: { id: "tenant-1", name: "Test" },
};

vi.mock("@/lib/action-wrapper", () => ({
  requireTenant: vi.fn(() => Promise.resolve(ctx)),
  withTenant: vi.fn((handler: (c: typeof ctx) => Promise<unknown>) => handler(ctx)),
  withUser: vi.fn((handler: (userId: string) => Promise<unknown>) => handler("user-1")),
}));

function createMockDb() {
  const returning = vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]);
  const values = vi.fn(() => ({ returning }));
  const insert = vi.fn(() => ({ values }));
  return { insert, values, returning };
}

let dbMocks: ReturnType<typeof createMockDb>;

const plans = vi.hoisted(() => ({
  checkPlanLimit: vi.fn(),
  planLimitMessage: vi.fn(async (hit: { resource: string; planNameKey: string; limit: number }) => {
    const plan = hit.planNameKey === "freeName" ? "Free" : hit.planNameKey;
    return hit.resource === "listings"
      ? `Your ${plan} plan allows a maximum of ${hit.limit} listings. Upgrade to add more.`
      : `Your ${plan} plan allows a maximum of ${hit.limit} team members. Upgrade to add more.`;
  }),
}));

vi.mock("@/lib/db", () => ({
  get db() {
    return { insert: dbMocks.insert };
  },
}));

vi.mock("@/lib/plans", () => plans);

beforeEach(() => {
  dbMocks = createMockDb();
  plans.checkPlanLimit.mockResolvedValue(null);
});

describe("listing actions", () => {
  it("createListing succeeds with valid form data", async () => {
    dbMocks.returning
      .mockResolvedValueOnce([{ id: "listing-1", title: "Test Listing" }])
      .mockResolvedValueOnce([{ id: "activity-1" }]);

    const { createListing } = await import("@/app/(dashboard)/actions");
    const fd = new FormData();
    fd.set("title", "Modern Apartment");
    fd.set("price", "250000");
    fd.set("status", "PUBLISHED");

    const result = await createListing(fd);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Listing created successfully");
    expect(dbMocks.insert).toHaveBeenCalled();
    expect(dbMocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Modern Apartment",
        price: 250000,
        status: "PUBLISHED",
        tenantId: "tenant-1",
      }),
    );
  });

  it("createListing returns plan limit message without inserting", async () => {
    plans.checkPlanLimit.mockResolvedValueOnce({
      planId: "free",
      planNameKey: "freeName",
      limit: 5,
      resource: "listings",
    });

    const { createListing } = await import("@/app/(dashboard)/actions");
    const fd = new FormData();
    fd.set("title", "Blocked");
    fd.set("price", "100000");

    const result = await createListing(fd);
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Your Free plan allows a maximum of 5 listings. Upgrade to add more.",
    );
    expect(dbMocks.insert).not.toHaveBeenCalled();
  });

  it("createListing fails on missing title", async () => {
    const { createListing } = await import("@/app/(dashboard)/actions");
    const fd = new FormData();
    fd.set("price", "250000");

    const result = await createListing(fd);
    expect(result.success).toBe(false);
    expect(dbMocks.insert).not.toHaveBeenCalled();
  });

  it("createListing fails on missing price", async () => {
    const { createListing } = await import("@/app/(dashboard)/actions");
    const fd = new FormData();
    fd.set("title", "Test");

    const result = await createListing(fd);
    expect(result.success).toBe(false);
    expect(dbMocks.insert).not.toHaveBeenCalled();
  });
});

describe("deal actions", () => {
  it("createDeal succeeds with valid data", async () => {
    dbMocks.returning.mockResolvedValueOnce([{ id: "deal-1", name: "Sale" }]);

    const { createDeal } = await import("@/app/(dashboard)/deals/actions");
    const result = await createDeal({ name: "Sale" });
    expect(result.success).toBe(true);
    expect(dbMocks.values).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sale", tenantId: "tenant-1" }),
    );
  });

  it("createDeal fails on missing name", async () => {
    const { createDeal } = await import("@/app/(dashboard)/deals/actions");
    const result = await createDeal({ name: "" });
    expect(result.success).toBe(false);
    expect(dbMocks.insert).not.toHaveBeenCalled();
  });
});
