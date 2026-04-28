import { beforeEach, describe, expect, it, vi } from "vitest";
import { invitation, teamMember, user, userSettings } from "@/db/schema";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/currentTenant", () => ({ getCurrentTenant: vi.fn() }));

type Row = Record<string, unknown>;
const members: Row[] = [];
const users: Row[] = [];
const settings: Row[] = [];
const invitations: Row[] = [];
const subscriptions: Row[] = [];
const insertCalls: { table: unknown; values: unknown }[] = [];
const upsertCalls: { table: unknown; values: unknown; set: unknown }[] = [];
const updateCalls: { table: unknown; values: unknown }[] = [];
const deleteCalls: { table: unknown }[] = [];

function limitRows(table: unknown, n: number): unknown[] {
  const tableMap = new Map<unknown, unknown[]>([
    [teamMember, members],
    [user, users],
    [userSettings, settings],
    [invitation, invitations],
  ]);
  return (tableMap.get(table) ?? subscriptions).slice(0, n);
}

vi.mock("@/lib/db", () => ({
  db: {
    select: (_fields?: unknown) => ({
      from: (table: unknown) => ({
        where: (_cond: unknown, _extra?: unknown) => ({
          limit: (n: number) => {
            // count() queries return a count row
            if (_fields && typeof _fields === "object" && "count" in (_fields as object)) {
              const rows = limitRows(table, n);
              return [{ count: rows.length }];
            }
            return limitRows(table, n);
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
      values: (values: unknown) => {
        insertCalls.push({ table, values });
        return {
          returning: () => [],
          onConflictDoUpdate: ({ set }: { target: unknown; set: unknown }) => {
            upsertCalls.push({ table, values, set });
          },
        };
      },
    }),
    delete: (table: unknown) => ({
      where: () => {
        deleteCalls.push({ table });
      },
    }),
  },
}));

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import {
  cancelInvitation,
  changePlan,
  inviteTeamMember,
  removeMember,
  updateMemberRole,
  updateNotifications,
  updateProfile,
} from "./actions";

const mockSession = getSession as ReturnType<typeof vi.fn>;
const mockTenant = getCurrentTenant as ReturnType<typeof vi.fn>;

const SESSION = { user: { id: "u1", email: "u@test.com", name: "User" } };
const TENANT = { id: "t1", name: "Acme", slug: "acme", branding: {} };

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

beforeEach(() => {
  members.length = 0;
  users.length = 0;
  settings.length = 0;
  invitations.length = 0;
  subscriptions.length = 0;
  insertCalls.length = 0;
  upsertCalls.length = 0;
  updateCalls.length = 0;
  deleteCalls.length = 0;
  vi.clearAllMocks();
});

describe("withAuth guard", () => {
  it("rejects unauthenticated calls", async () => {
    mockSession.mockResolvedValue(null as never);
    const result = await updateProfile(fd({ name: "Alice" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not authenticated/i);
  });
});

describe("updateProfile", () => {
  it("fails when name is empty", async () => {
    mockSession.mockResolvedValue(SESSION as never);
    const result = await updateProfile(fd({ name: "" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/name is required/i);
  });

  it("updates user and revalidates", async () => {
    mockSession.mockResolvedValue(SESSION as never);
    const result = await updateProfile(fd({ name: "Alice", image: "https://img.com/a.png" }));
    expect(result.success).toBe(true);
    expect(updateCalls[0]?.table).toBe(user);
    expect(revalidatePath).toHaveBeenCalledWith("/settings");
  });
});

describe("updateNotifications", () => {
  it("inserts settings when none exist", async () => {
    mockSession.mockResolvedValue(SESSION as never);
    // settings array is empty → no existing record
    const result = await updateNotifications(fd({ emailNewLead: "on", pushNewOffer: "on" }));
    expect(result.success).toBe(true);
    expect(insertCalls[0]?.table).toBe(userSettings);
  });

  it("upserts settings when they already exist", async () => {
    mockSession.mockResolvedValue(SESSION as never);
    settings.push({ id: "s1", userId: "u1", notifications: {} });
    const result = await updateNotifications(fd({ emailNewLead: "on" }));
    expect(result.success).toBe(true);
    expect(upsertCalls[0]?.table).toBe(userSettings);
  });

  it("maps checkbox 'on' to true and missing to false", async () => {
    mockSession.mockResolvedValue(SESSION as never);
    await updateNotifications(fd({ emailNewLead: "on" }));
    const upserted = insertCalls[0]?.values as { notifications: Record<string, boolean> };
    expect(upserted.notifications.emailNewLead).toBe(true);
    expect(upserted.notifications.emailNewOffer).toBe(false);
  });
});

describe("withAdmin guard", () => {
  it("rejects non-admin users", async () => {
    mockSession.mockResolvedValue(SESSION as never);
    mockTenant.mockResolvedValue(TENANT as never);
    members.push({ id: "m1", userId: "u1", tenantId: "t1", role: "agent" });
    const result = await inviteTeamMember(fd({ email: "x@x.com" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/permission/i);
  });
});

describe("inviteTeamMember", () => {
  beforeEach(() => {
    mockSession.mockResolvedValue(SESSION as never);
    mockTenant.mockResolvedValue(TENANT as never);
    members.push({ id: "m1", userId: "u1", tenantId: "t1", role: "owner" });
    // Use pro plan so member limit doesn't interfere with invite logic tests
    subscriptions.push({ id: "sub1", tenantId: "t1", plan: "pro" });
  });

  it("fails when email is missing", async () => {
    const result = await inviteTeamMember(fd({}));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/email is required/i);
  });

  it("rejects existing team member", async () => {
    users.push({ id: "u2", email: "existing@test.com" });
    members.push({ id: "m2", userId: "u2", tenantId: "t1", role: "agent" });
    const result = await inviteTeamMember(fd({ email: "existing@test.com" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already a team member/i);
  });

  it("rejects duplicate pending invitation", async () => {
    invitations.push({ id: "i1", email: "new@test.com", tenantId: "t1", status: "pending" });
    const result = await inviteTeamMember(fd({ email: "new@test.com" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/pending invitation/i);
  });

  it("creates invitation and revalidates", async () => {
    const result = await inviteTeamMember(fd({ email: "new@test.com", role: "agent" }));
    expect(result.success).toBe(true);
    expect(insertCalls[0]?.table).toBe(invitation);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/team");
  });
});

describe("updateMemberRole", () => {
  beforeEach(() => {
    mockSession.mockResolvedValue(SESSION as never);
    mockTenant.mockResolvedValue(TENANT as never);
    members.push({ id: "m1", userId: "u1", tenantId: "t1", role: "owner" });
  });

  it("fails when memberId or role is missing", async () => {
    const result = await updateMemberRole(fd({}));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/missing/i);
  });

  it("prevents non-owner from assigning owner role", async () => {
    members[0] = { id: "m1", userId: "u1", tenantId: "t1", role: "admin" };
    members.push({ id: "m2", userId: "u2", tenantId: "t1", role: "agent" });
    const result = await updateMemberRole(fd({ memberId: "m2", role: "owner" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/only owners/i);
  });

  it("updates role and revalidates", async () => {
    members.push({ id: "m2", userId: "u2", tenantId: "t1", role: "agent" });
    const result = await updateMemberRole(fd({ memberId: "m2", role: "admin" }));
    expect(result.success).toBe(true);
    expect(updateCalls[0]?.table).toBe(teamMember);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/team");
  });
});

describe("removeMember", () => {
  beforeEach(() => {
    mockSession.mockResolvedValue(SESSION as never);
    mockTenant.mockResolvedValue(TENANT as never);
    // Only the owner member — isAdmin check finds this first
    members.push({ id: "m1", userId: "u1", tenantId: "t1", role: "owner" });
  });

  it("fails when memberId is missing", async () => {
    const result = await removeMember(fd({}));
    expect(result.success).toBe(false);
  });

  it("prevents removing the owner", async () => {
    // Target is also an owner — second query returns m1 (owner)
    const result = await removeMember(fd({ memberId: "m1" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/cannot remove the owner/i);
  });

  it("removes agent member and revalidates", async () => {
    // Single admin member: satisfies isAdmin check AND passes the owner guard
    // (role "admin" ≠ "owner"), since the mock returns slice(0,1) for both queries.
    members.length = 0;
    members.push({ id: "m-admin", userId: "u1", tenantId: "t1", role: "admin" });

    const result = await removeMember(fd({ memberId: "m-admin" }));
    expect(result.success).toBe(true);
    expect(deleteCalls[0]?.table).toBe(teamMember);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/team");
  });
});

describe("cancelInvitation", () => {
  beforeEach(() => {
    mockSession.mockResolvedValue(SESSION as never);
    mockTenant.mockResolvedValue(TENANT as never);
    members.push({ id: "m1", userId: "u1", tenantId: "t1", role: "owner" });
  });

  it("fails when invitationId is missing", async () => {
    const result = await cancelInvitation(fd({}));
    expect(result.success).toBe(false);
  });

  it("deletes invitation and revalidates", async () => {
    const result = await cancelInvitation(fd({ invitationId: "inv-1" }));
    expect(result.success).toBe(true);
    expect(deleteCalls[0]?.table).toBe(invitation);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/team");
  });
});

describe("changePlan", () => {
  beforeEach(() => {
    mockSession.mockResolvedValue(SESSION as never);
    mockTenant.mockResolvedValue(TENANT as never);
    members.push({ id: "m1", userId: "u1", tenantId: "t1", role: "owner" });
  });

  it("rejects invalid plan names", async () => {
    const result = await changePlan(fd({ plan: "gold" }));
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/invalid plan/i);
  });

  it("creates subscription when none exists", async () => {
    const result = await changePlan(fd({ plan: "pro" }));
    expect(result.success).toBe(true);
    expect(insertCalls[0]?.table).toBe((await import("@/db/schema")).subscription);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/billing");
  });

  it("upserts existing subscription", async () => {
    const { subscription } = await import("@/db/schema");
    subscriptions.push({ id: "s1", tenantId: "t1", plan: "free" });
    const result = await changePlan(fd({ plan: "enterprise" }));
    expect(result.success).toBe(true);
    expect(upsertCalls[0]?.table).toBe(subscription);
  });
});
