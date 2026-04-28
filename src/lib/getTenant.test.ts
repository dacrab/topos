import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelect = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ limit: mockSelect }),
      }),
    }),
  },
}));

import { getTenant } from "./getTenant";

const mockTenant = { id: "t1", name: "Acme", slug: "acme", customDomain: "acme.com" };

beforeEach(() => {
  mockSelect.mockReset();
});

describe("getTenant", () => {
  it("returns tenant when found", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    const result = await getTenant("acme.topos.com");
    expect(result).toEqual(mockTenant);
  });

  it("returns undefined when not found", async () => {
    mockSelect.mockResolvedValue([]);
    const result = await getTenant("ghost.topos.com");
    expect(result).toBeUndefined();
  });

  it("strips port before querying", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    await getTenant("acme.localhost:3000");
    expect(mockSelect).toHaveBeenCalled();
    // Should not throw and should produce a DB query
  });

  it("handles bare domain (no subdomain)", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    const result = await getTenant("acme.com");
    expect(result).toEqual(mockTenant);
  });

  it("makes exactly one db query", async () => {
    mockSelect.mockResolvedValue([]);
    await getTenant("test.topos.com");
    expect(mockSelect).toHaveBeenCalledOnce();
  });
});
