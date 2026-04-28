import type { Mock } from "vitest";
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
import { createListing } from "./actions";

const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;
const mockGetCurrentTenant = getCurrentTenant as ReturnType<typeof vi.fn>;

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

  it("rejects when title is missing", async () => {
    const result = await createListing(createFormData({ price: "100" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Title is required");
    expect(insertCalls.length).toBe(0);
  });

  it("rejects when price is invalid", async () => {
    const result = await createListing(createFormData({ title: "Test", price: "-5" }));
    expect(result).toMatchObject({ success: false, error: "Valid price required" });
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
