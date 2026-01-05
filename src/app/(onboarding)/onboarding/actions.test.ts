import { beforeEach, describe, expect, it, vi } from "vitest";
import { teamMember, tenant, user } from "@/db/schema";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

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
            if (table === teamMember) return [];
            return [];
          },
        }),
      }),
    }),
    update: (table: unknown) => ({
      set: (values: unknown) => ({
        where: () => {
          updateCalls.push({ table, values });
          if (table === tenant && tenants[0]) Object.assign(tenants[0], values);
        },
      }),
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        insertCalls.push({ table, values });
        const id = `${String(table)}-${insertCalls.length}`;
        if (table === tenant) tenants.push({ id, ...values });
        return { returning: () => [{ id, ...values }] };
      },
    }),
  },
}));

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { completeOnboarding } from "./actions";

const mockGetSession = vi.mocked(auth.api.getSession);

beforeEach(() => {
  tenants.length = 0;
  users.length = 0;
  insertCalls.length = 0;
  updateCalls.length = 0;
  vi.clearAllMocks();
});

describe("completeOnboarding", () => {
  it("fails when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await completeOnboarding({
      agencyName: "Test",
      slug: "test",
      phone: "",
      email: "",
      address: "",
      website: "",
    });

    expect(result.success).toBe(false);
    expect(insertCalls).toHaveLength(0);
  });

  it("rejects duplicate slug", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" } } as never);
    tenants.push({ id: "other", slug: "taken" });
    users.push({ id: "u1", tenantId: "mine" });

    const result = await completeOnboarding({
      agencyName: "Test",
      slug: "taken",
      phone: "",
      email: "",
      address: "",
      website: "",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("taken");
  });

  it("updates existing tenant", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" } } as never);
    tenants.push({ id: "t1", slug: "old" });
    users.push({ id: "u1", tenantId: "t1" });

    const result = await completeOnboarding({
      agencyName: "New Name",
      slug: "new-slug",
      phone: "123",
      email: "a@b.com",
      address: "St",
      website: "https://x.com",
    });

    expect(result.success).toBe(true);
    expect(tenants[0].name).toBe("New Name");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("creates new tenant when user has none", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" } } as never);
    users.push({ id: "u1", tenantId: null });

    const result = await completeOnboarding({
      agencyName: "Fresh",
      slug: "fresh",
      phone: "",
      email: "",
      address: "",
      website: "",
    });

    expect(result.success).toBe(true);
    expect(tenants).toHaveLength(1);
    expect(tenants[0].slug).toBe("fresh");
  });
});
