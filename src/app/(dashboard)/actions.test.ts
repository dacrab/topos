import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/currentTenant", () => ({ getCurrentTenant: vi.fn() }));

type DbCall = { table: unknown; values?: unknown; whereArg?: unknown };
const insertCalls: DbCall[] = [];
const deleteCalls: DbCall[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    insert: (table: unknown) => ({
      values: (values: unknown) => {
        insertCalls.push({ table, values });
        return { returning: () => [{ id: "listing-123" }] };
      },
    }),
    delete: (table: unknown) => ({
      where: (whereArg: unknown) => {
        deleteCalls.push({ table, whereArg });
      },
    }),
  },
}));

import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { createListing, dismissActivity, dismissAllActivities } from "./actions";

const mockRevalidatePath = revalidatePath as unknown as Mock;
const mockGetCurrentTenant = getCurrentTenant as unknown as Mock;

function createFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

beforeEach(() => {
  insertCalls.length = 0;
  deleteCalls.length = 0;
  vi.clearAllMocks();
});

describe("createListing", () => {
  it("persists listing with valid data", async () => {
    mockGetCurrentTenant.mockResolvedValue({ id: "tenant-42", name: "Test" });

    const result = await createListing(
      createFormData({
        title: "Modern Loft",
        description: "Top-floor loft",
        price: "250000",
        status: "PUBLISHED",
        beds: "2",
        baths: "1",
        images: JSON.stringify(["https://example.com/img.jpg"]),
        amenities: JSON.stringify(["parking"]),
      }),
    );

    expect(result).toEqual({ success: true });
    expect(insertCalls.length).toBe(2);
    expect(insertCalls[0]?.table).toBe(listing);
    expect(insertCalls[1]?.table).toBe(activity);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/listings");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects invalid data", async () => {
    const noTitle = await createListing(createFormData({ price: "100" }));
    expect(noTitle.success).toBe(false);
    expect(noTitle.error).toContain("expected string");
    expect(insertCalls.length).toBe(0);

    const badPrice = await createListing(createFormData({ title: "Test", price: "-5" }));
    expect(badPrice).toMatchObject({ success: false, error: "Price must be positive" });
  });

  it("fails gracefully when serialized arrays are malformed", async () => {
    mockGetCurrentTenant.mockResolvedValue({ id: "tenant-42", name: "Test" });

    const result = await createListing(
      createFormData({
        title: "Broken Loft",
        price: "100",
        images: "not-json",
      }),
    );

    expect(result).toEqual({ success: false, error: "Failed to create listing" });
    expect(insertCalls.length).toBe(0);
  });
});

describe("dismissActivity", () => {
  it("deletes activity by id", async () => {
    await dismissActivity("activity-1");
    expect(deleteCalls[0]?.table).toBe(activity);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

describe("dismissAllActivities", () => {
  it("deletes all tenant activities scoped to tenant", async () => {
    mockGetCurrentTenant.mockResolvedValue({ id: "tenant-99" });
    await dismissAllActivities();
    expect(deleteCalls[0]?.table).toBe(activity);
    expect(mockGetCurrentTenant).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
