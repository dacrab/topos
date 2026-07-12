import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/page-helpers", () => ({
  requireDashboardAuth: vi.fn(() =>
    Promise.resolve({
      userId: "user-1",
      tenantId: "tenant-1",
      session: { user: { id: "user-1", email: "test@test.com" } },
      tenant: { id: "tenant-1", name: "Test" },
    }),
  ),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

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
    const p = Promise.resolve([]) as unknown as Promise<unknown[]> & {
      limit: (...args: unknown[]) => unknown;
      orderBy: (...args: unknown[]) => unknown;
      offset: (...args: unknown[]) => unknown;
    };
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

beforeEach(() => {
  dbMocks = createMockDb();
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
    expect(dbMocks.insert).toHaveBeenCalledTimes(2);
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

describe("contact actions", () => {
  it("createContact succeeds with valid data", async () => {
    dbMocks.returning.mockResolvedValueOnce([{ id: "contact-1", firstName: "John" }]);

    const { createContact } = await import("@/app/(dashboard)/contacts/actions");
    const result = await createContact({
      firstName: "John",
      lastName: "Doe",
      type: "LEAD",
    });
    expect(result.success).toBe(true);
    expect(dbMocks.insert).toHaveBeenCalled();
  });

  it("createContact throws on missing firstName", async () => {
    const { createContact } = await import("@/app/(dashboard)/contacts/actions");

    await expect(
      createContact({ lastName: "Doe" } as Parameters<typeof createContact>[0]),
    ).rejects.toThrow();
    expect(dbMocks.insert).not.toHaveBeenCalled();
  });

  it("createContact throws on invalid email", async () => {
    const { createContact } = await import("@/app/(dashboard)/contacts/actions");

    await expect(
      createContact({ firstName: "John", email: "not-an-email", type: "LEAD" }),
    ).rejects.toThrow();
    expect(dbMocks.insert).not.toHaveBeenCalled();
  });

  it("listContacts returns contacts", async () => {
    dbMocks.limit.mockImplementation(() => ({
      offset: vi.fn().mockResolvedValue([{ id: "contact-1", firstName: "Alice" }]),
    }));

    const { listContacts } = await import("@/app/(dashboard)/contacts/actions");
    const result = await listContacts(10, 0);
    expect(result.success).toBe(true);
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0]?.firstName).toBe("Alice");
  });
});
