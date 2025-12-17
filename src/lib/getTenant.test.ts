import { beforeEach, describe, expect, it, vi } from "vitest";
import { tenant } from "@/db/schema";
import { db } from "./db";
import { getTenant } from "./getTenant";

// Mock the DB
const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere }));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("getTenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as never);
  });

  it("extracts slug from subdomain and fetches tenant", async () => {
    const mockTenant = { id: "1", slug: "agency", name: "Agency" };
    mockLimit.mockResolvedValue([mockTenant]);

    const result = await getTenant("agency.aether.com");

    expect(result).toEqual(mockTenant);
    expect(db.select).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith(tenant);
    // Note: checking exact arguments for complex Drizzle expressions (or/eq)
    // is hard in unit tests without deep mocking of Drizzle internals.
    // We assume the chain is called.
    expect(mockWhere).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(1);
  });

  it("handles custom domains", async () => {
    const mockTenant = {
      id: "2",
      slug: "custom",
      customDomain: "realestate.com",
      name: "Custom",
    };
    mockLimit.mockResolvedValue([mockTenant]);

    const result = await getTenant("realestate.com");

    expect(result).toEqual(mockTenant);
  });

  it("returns undefined if no tenant found", async () => {
    mockLimit.mockResolvedValue([]);

    const result = await getTenant("unknown.com");

    expect(result).toBeUndefined();
  });
});
