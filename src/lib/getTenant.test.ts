import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelect = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mockSelect,
        }),
      }),
    }),
  },
}));

import { getTenant } from "./getTenant";

const mockTenant = {
  id: "t1",
  name: "Acme",
  slug: "acme",
  customDomain: "acme.com",
};

beforeEach(() => {
  mockSelect.mockReset();
});

describe("getTenant", () => {
  it("returns tenant when found by slug", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    const result = await getTenant("acme.topos.com");
    expect(result).toEqual(mockTenant);
  });

  it("returns tenant when found by custom domain", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    const result = await getTenant("acme.com");
    expect(result).toEqual(mockTenant);
  });

  it("returns undefined when no tenant found", async () => {
    mockSelect.mockResolvedValue([]);
    const result = await getTenant("unknown.topos.com");
    expect(result).toBeUndefined();
  });

  it("strips port from hostname before querying", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    // localhost:3000 should strip port and use slug "localhost"
    const result = await getTenant("acme.localhost:3000");
    expect(result).toEqual(mockTenant);
    expect(mockSelect).toHaveBeenCalled();
  });

  it("extracts subdomain as slug from dotted hostname", async () => {
    mockSelect.mockResolvedValue([mockTenant]);
    await getTenant("acme.topos.com");
    expect(mockSelect).toHaveBeenCalledWith(1);
  });

  it("uses full hostname as slug when no dots present", async () => {
    mockSelect.mockResolvedValue([]);
    await getTenant("localhost");
    expect(mockSelect).toHaveBeenCalledWith(1);
  });
});
