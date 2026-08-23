import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (ns: string) => {
    const dicts: Record<string, Record<string, string>> = {
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
  const m = {
    returning: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    values: vi.fn(),
    insert: vi.fn(),
    limit: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve([])),
    offset: vi.fn<(...args: unknown[]) => unknown>(() => Promise.resolve([])),
    orderBy: vi.fn<() => Promise<unknown[]>>(),
    where: vi.fn<() => Promise<unknown[]>>(),
    from: vi.fn(),
    select: vi.fn(),
    whereDelete: vi.fn(),
    del: vi.fn(),
    setUpdate: vi.fn(),
    whereUpdate: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(() => Promise.resolve([])),
  };

  function chain(): Promise<unknown[]> & {
    limit: (...args: unknown[]) => unknown;
    orderBy: (...args: unknown[]) => unknown;
    offset: (...args: unknown[]) => unknown;
  } {
    const p: Promise<unknown[]> & {
      limit: (...args: unknown[]) => unknown;
      orderBy: (...args: unknown[]) => unknown;
      offset: (...args: unknown[]) => unknown;
    } = Object.assign(Promise.resolve([]), {
      limit: (...args: unknown[]) => (m.limit as (...a: unknown[]) => unknown)(...args),
      orderBy: (...args: unknown[]) => (m.orderBy as (...a: unknown[]) => unknown)(...args),
      offset: (...args: unknown[]) => (m.offset as (...a: unknown[]) => unknown)(...args),
    });
    p.limit = (...args: unknown[]) => (m.limit as (...a: unknown[]) => unknown)(...args);
    p.orderBy = (...args: unknown[]) => (m.orderBy as (...a: unknown[]) => unknown)(...args);
    p.offset = (...args: unknown[]) => (m.offset as (...a: unknown[]) => unknown)(...args);
    return p;
  }

  m.values = vi.fn(() => ({ returning: m.returning }));
  m.insert = vi.fn(() => ({ values: m.values }));
  m.orderBy = vi.fn(() => chain());
  m.where = vi.fn(() => chain());
  m.from = vi.fn(() => ({ where: m.where }));
  m.select = vi.fn(() => ({ from: m.from }));
  m.whereDelete = vi.fn(() => ({ returning: m.returning }));
  m.del = vi.fn(() => ({ where: m.whereDelete }));
  m.whereUpdate = vi.fn(() => ({ returning: m.returning }));
  m.setUpdate = vi.fn(() => ({ where: m.whereUpdate }));
  m.update = vi.fn(() => ({ set: m.setUpdate }));

  return m;
}

let dbMocks: ReturnType<typeof createMockDb>;

const plans = vi.hoisted(() => ({ checkPlanLimit: vi.fn() }));

vi.mock("@/lib/db", () => ({
  get db() {
    return {
      insert: dbMocks.insert,
      select: dbMocks.select,
      delete: dbMocks.del,
      update: dbMocks.update,
      query: { activity: { findMany: dbMocks.findMany } },
    };
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

  it("deleteListing succeeds", async () => {
    dbMocks.returning.mockResolvedValueOnce([{ id: "listing-1" }]);

    const { deleteListing } = await import("@/app/(dashboard)/actions");
    const result = await deleteListing("listing-1");
    expect(result.success).toBe(true);
    expect(dbMocks.del).toHaveBeenCalled();
  });

  it("deleteListing fails when not found", async () => {
    const { deleteListing } = await import("@/app/(dashboard)/actions");
    const result = await deleteListing("nonexistent");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Listing not found or access denied");
  });

  it("toggleListingStatus toggles PUBLISHED to DRAFT", async () => {
    dbMocks.limit.mockResolvedValueOnce([{ id: "listing-1", status: "PUBLISHED" }]);
    dbMocks.returning.mockResolvedValueOnce([{ id: "listing-1", status: "DRAFT" }]);

    const { toggleListingStatus } = await import("@/app/(dashboard)/actions");
    const result = await toggleListingStatus("listing-1");
    expect(result.success).toBe(true);
    expect(result.status).toBe("DRAFT");
  });

  it("toggleListingStatus toggles DRAFT to PUBLISHED", async () => {
    dbMocks.limit.mockResolvedValueOnce([{ id: "listing-1", status: "DRAFT" }]);
    dbMocks.returning.mockResolvedValueOnce([{ id: "listing-1", status: "PUBLISHED" }]);

    const { toggleListingStatus } = await import("@/app/(dashboard)/actions");
    const result = await toggleListingStatus("listing-1");
    expect(result.success).toBe(true);
    expect(result.status).toBe("PUBLISHED");
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
