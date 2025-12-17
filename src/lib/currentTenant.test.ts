import { beforeEach, describe, expect, it, vi } from "vitest";
import { tenant, user } from "@/db/schema";
import { auth } from "./auth";
import { getCurrentTenant } from "./currentTenant";
import { db } from "./db";

// Mocks
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere }));

const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));

const mockSet = vi.fn(() => ({ where: vi.fn() })); // update().set().where()

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe("getCurrentTenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as never);
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as never);
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as never);
  });

  it("returns existing demo tenant if no session and demo exists", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    mockLimit.mockResolvedValueOnce([
      { id: "demo-id", slug: "demo", name: "Demo Brokerage" },
    ]);

    const result = await getCurrentTenant();

    expect(result).toEqual({
      id: "demo-id",
      slug: "demo",
      name: "Demo Brokerage",
    });
    expect(auth.api.getSession).toHaveBeenCalled();
    expect(db.select).toHaveBeenCalled();
  });

  it("creates and returns new demo tenant if no session and demo missing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    mockLimit.mockResolvedValueOnce([]); // No existing demo
    mockReturning.mockResolvedValueOnce([
      { id: "new-demo", slug: "demo", name: "Demo Brokerage" },
    ]);

    const result = await getCurrentTenant();

    expect(result).toEqual({
      id: "new-demo",
      slug: "demo",
      name: "Demo Brokerage",
    });
    expect(db.insert).toHaveBeenCalledWith(tenant);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "demo" }),
    );
  });

  it("returns user's existing tenant if session exists and user is linked", async () => {
    const session = { user: { id: "user-1", name: "Alice" } };
    vi.mocked(auth.api.getSession).mockResolvedValue(session as never);

    // 1. Fetch user to check tenantId
    mockLimit.mockResolvedValueOnce([{ id: "user-1", tenantId: "tenant-1" }]);

    // 2. Fetch tenant
    mockLimit.mockResolvedValueOnce([{ id: "tenant-1", slug: "alice-corp" }]);

    const result = await getCurrentTenant();

    expect(result).toEqual({ id: "tenant-1", slug: "alice-corp" });
  });

  it("creates personal tenant and links user if session exists but no tenant linked", async () => {
    const session = { user: { id: "user-2", name: "Bob" } };
    vi.mocked(auth.api.getSession).mockResolvedValue(session as never);

    // 1. Fetch user (no tenantId)
    mockLimit.mockResolvedValueOnce([{ id: "user-2", tenantId: null }]);

    // 2. Check if personal tenant exists (assume no)
    mockLimit.mockResolvedValueOnce([]);

    // 3. Create tenant
    const newTenant = { id: "tenant-2", slug: "user-user-2", name: "Bob" };
    mockReturning.mockResolvedValueOnce([newTenant]);

    // 4. Update user
    // (mockUpdate is setup in beforeEach)

    const result = await getCurrentTenant();

    expect(result).toEqual(newTenant);
    expect(db.insert).toHaveBeenCalledWith(tenant);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "user-user-2",
        name: "Bob",
      }),
    );
    expect(db.update).toHaveBeenCalledWith(user);
    expect(mockSet).toHaveBeenCalledWith({ tenantId: "tenant-2" });
  });
});
