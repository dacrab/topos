import { beforeEach, describe, expect, it, vi } from "vitest";
import { teamMember, tenant, user } from "@/db/schema";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

type Row = Record<string, unknown>;

const tenants: Row[] = [];
const users: Row[] = [];
const teamMembers: Row[] = [];

type UpdateCall = { table: unknown; values: unknown };
type InsertCall = { table: unknown; values: unknown };

const updateCalls: UpdateCall[] = [];
const insertCalls: InsertCall[] = [];

vi.mock("@/lib/db", () => {
  const db = {
    select: () => ({
      from: (table: unknown) => ({
        where: (_where: unknown) => ({
          limit: (limit: number) => {
            if (table === tenant) return tenants.slice(0, limit);
            if (table === user) return users.slice(0, limit);
            if (table === teamMember) return teamMembers.slice(0, limit);
            return [];
          },
        }),
      }),
    }),
    update: (table: unknown) => ({
      set: (values: unknown) => ({
        where: (_where: unknown) => {
          updateCalls.push({ table, values });
          if (table === tenant && tenants[0]) {
            Object.assign(tenants[0], values);
          }
          if (table === user && users[0]) {
            Object.assign(users[0], values);
          }
        },
      }),
    }),
    insert: (table: unknown) => ({
      values: (values: Row) => {
        insertCalls.push({ table, values });
        if (table === tenant) {
          const created = { id: `tenant-${tenants.length + 1}`, ...values };
          tenants.push(created);
          return {
            returning: () => [created],
          };
        }
        if (table === teamMember) {
          const created = { id: `member-${teamMembers.length + 1}`, ...values };
          teamMembers.push(created);
          return {
            returning: () => [created],
          };
        }
        if (table === user) {
          const created = { id: `user-${users.length + 1}`, ...values };
          users.push(created);
          return {
            returning: () => [created],
          };
        }
        return {
          returning: () => [],
        };
      },
    }),
  };

  return { db };
});

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { completeOnboarding } from "./actions";

const mockRevalidatePath = revalidatePath as unknown as ReturnType<
  typeof vi.fn
>;
const mockGetSession = auth.api.getSession as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  tenants.length = 0;
  users.length = 0;
  teamMembers.length = 0;
  updateCalls.length = 0;
  insertCalls.length = 0;
  vi.clearAllMocks();
});

describe("completeOnboarding", () => {
  it("returns a failure result when the user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await completeOnboarding({
      agencyName: "Acme Realty",
      slug: "acme",
      phone: "",
      email: "",
      address: "",
      website: "",
    });

    expect(result).toEqual({ success: false, message: "Not authenticated" });
    expect(tenants).toHaveLength(0);
    expect(users).toHaveLength(0);
    expect(teamMembers).toHaveLength(0);
    expect(updateCalls).toHaveLength(0);
    expect(insertCalls).toHaveLength(0);
  });

  it("rejects a slug that belongs to a different tenant", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

    tenants.push({ id: "tenant-other", slug: "taken-subdomain" });
    users.push({ id: "user-1", tenantId: "tenant-self" });

    const result = await completeOnboarding({
      agencyName: "Acme Realty",
      slug: "taken-subdomain",
      phone: "",
      email: "",
      address: "",
      website: "",
    });

    expect(result).toEqual({
      success: false,
      message: "This subdomain is already taken",
    });
    expect(updateCalls).toHaveLength(0);
    expect(insertCalls).toHaveLength(0);
  });

  it("updates an existing tenant and creates an owner team member when needed", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

    tenants.push({ id: "tenant-1", slug: "old-slug" });
    users.push({ id: "user-1", tenantId: "tenant-1" });

    const result = await completeOnboarding({
      agencyName: "New Name Realty",
      slug: "new-slug",
      phone: "+123456789",
      email: "office@example.com",
      address: "123 Main St",
      website: "https://example.com",
    });

    expect(result).toEqual({
      success: true,
      message: "Onboarding completed",
    });

    expect(updateCalls.some((c) => c.table === tenant)).toBe(true);
    const tenantRow = tenants[0];
    expect(tenantRow.name).toBe("New Name Realty");
    expect(tenantRow.slug).toBe("new-slug");
    expect(tenantRow.onboardingCompleted).toBe(true);
    expect(tenantRow.branding).toEqual({
      phone: "+123456789",
      email: "office@example.com",
      address: "123 Main St",
      website: "https://example.com",
    });

    expect(
      insertCalls.some((c) => {
        if (c.table !== teamMember) return false;
        const values = c.values as { role?: string };
        return values.role === "owner";
      }),
    ).toBe(true);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("creates a new tenant, links the user, and ensures team membership when the user has no tenant", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });

    users.push({ id: "user-1", tenantId: null });

    const result = await completeOnboarding({
      agencyName: "Green Valley Realty",
      slug: "green-valley",
      phone: "",
      email: "",
      address: "",
      website: "",
    });

    expect(result).toEqual({
      success: true,
      message: "Onboarding completed",
    });

    expect(tenants).toHaveLength(1);
    const [createdTenant] = tenants;
    expect(createdTenant.name).toBe("Green Valley Realty");
    expect(createdTenant.slug).toBe("green-valley");
    expect(createdTenant.onboardingCompleted).toBe(true);

    expect(
      updateCalls.some((c) => {
        if (c.table !== user) return false;
        const values = c.values as { tenantId?: string };
        return values.tenantId === createdTenant.id;
      }),
    ).toBe(true);

    expect(
      insertCalls.some((c) => {
        if (c.table !== teamMember) return false;
        const values = c.values as { tenantId?: string };
        return values.tenantId === createdTenant.id;
      }),
    ).toBe(true);
  });
});
