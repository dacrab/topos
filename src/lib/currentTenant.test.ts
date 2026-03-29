import { beforeEach, describe, expect, it, vi } from "vitest";
import { tenant, user } from "@/db/schema";

vi.mock("@/lib/auth", () => ({ getSession: vi.fn() }));

const tenants: Record<string, unknown>[] = [];
const users: Record<string, unknown>[] = [];
const insertCalls: { table: unknown; values: unknown }[] = [];
const updateCalls: { table: unknown; values: unknown }[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: (n: number) => {
            if (table === tenant) return tenants.slice(0, n);
            if (table === user) return users.slice(0, n);
            return [];
          },
        }),
      }),
    }),
    update: (table: unknown) => ({
      set: (values: unknown) => ({
        where: () => {
          updateCalls.push({ table, values });
        },
      }),
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        insertCalls.push({ table, values });
        const id = `created-${insertCalls.length}`;
        const row = { id, ...values };
        if (table === tenant) tenants.push(row);
        return { returning: () => [row] };
      },
    }),
  },
}));

import { getSession } from "@/lib/auth";
import { getCurrentTenant } from "./currentTenant";

const mockSession = vi.mocked(getSession);

beforeEach(() => {
  tenants.length = 0;
  users.length = 0;
  insertCalls.length = 0;
  updateCalls.length = 0;
  vi.clearAllMocks();
});

describe("getCurrentTenant", () => {
  it("returns demo tenant when not authenticated", async () => {
    mockSession.mockResolvedValue(null as never);
    tenants.push({ id: "demo", slug: "demo", name: "Demo Brokerage" });

    const result = await getCurrentTenant();
    expect(result).toMatchObject({ slug: "demo" });
    expect(insertCalls).toHaveLength(0);
  });

  it("creates demo tenant if it doesn't exist", async () => {
    mockSession.mockResolvedValue(null as never);
    // tenants is empty — demo doesn't exist yet

    const result = await getCurrentTenant();
    expect(result).toBeDefined();
    expect(insertCalls[0]?.table).toBe(tenant);
    expect((insertCalls[0]?.values as Record<string, unknown>).slug).toBe("demo");
  });

  it("returns existing tenant when user has tenantId", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1", name: "Alice" } } as never);
    users.push({ id: "u1", tenantId: "t1" });
    tenants.push({ id: "t1", slug: "acme", name: "Acme" });

    const result = await getCurrentTenant();
    expect(result).toMatchObject({ id: "t1", slug: "acme" });
    expect(insertCalls).toHaveLength(0);
  });

  it("creates personal tenant when user has no tenantId", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1", name: "Alice" } } as never);
    users.push({ id: "u1", tenantId: null });
    // no existing tenant with slug user-u1

    const result = await getCurrentTenant();
    expect(result).toBeDefined();
    expect(insertCalls[0]?.table).toBe(tenant);
    expect((insertCalls[0]?.values as Record<string, unknown>).slug).toBe("user-u1");
    // should link user to new tenant
    expect(updateCalls[0]?.table).toBe(user);
  });

  it("reuses existing personal tenant and re-links user", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1", name: "Alice" } } as never);
    users.push({ id: "u1", tenantId: null });
    tenants.push({ id: "t-existing", slug: "user-u1", name: "Alice's Brokerage" });

    const result = await getCurrentTenant();
    expect(result).toMatchObject({ slug: "user-u1" });
    // Should update user.tenantId to link them
    expect(updateCalls[0]?.table).toBe(user);
    expect(insertCalls).toHaveLength(0);
  });

  it("uses default tenant name when user has no name", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1", name: null } } as never);
    users.push({ id: "u1", tenantId: null });

    await getCurrentTenant();
    const created = insertCalls[0]?.values as Record<string, unknown>;
    expect(typeof created.name).toBe("string");
    expect((created.name as string).length).toBeGreaterThan(0);
  });
});
