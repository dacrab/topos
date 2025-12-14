import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/currentTenant", () => ({
  getCurrentTenant: vi.fn(),
}));

type InsertCall = { table: unknown; values: unknown };
type DeleteCall = { table: unknown; whereArg: unknown };

const insertCalls: InsertCall[] = [];
const deleteCalls: DeleteCall[] = [];

vi.mock("@/lib/db", () => {
  const db = {
    insert: (table: unknown) => ({
      values: (values: unknown) => {
        insertCalls.push({ table, values });
        return {
          returning: () => [{ id: "listing-123" }],
        };
      },
    }),
    delete: (table: unknown) => ({
      where: (whereArg: unknown) => {
        deleteCalls.push({ table, whereArg });
      },
    }),
  };

  return { db };
});

import { revalidatePath } from "next/cache";
import { activity, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import {
  createListing,
  dismissActivity,
  dismissAllActivities,
} from "./actions";

const mockRevalidatePath = revalidatePath as unknown as Mock;
const mockGetCurrentTenant = getCurrentTenant as unknown as Mock;

function createFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  insertCalls.length = 0;
  deleteCalls.length = 0;
  vi.clearAllMocks();
});

describe("dashboard actions - createListing", () => {
  it("persists a normalized listing and activity when data is valid", async () => {
    mockGetCurrentTenant.mockResolvedValue({
      id: "tenant-42",
      name: "Test Tenant",
    });

    const formData = createFormData({
      title: "Modern Loft",
      description: "Top-floor loft with city views",
      price: "250000",
      status: "PUBLISHED",
      beds: "2",
      baths: "1",
      sqft: "80",
      yearBuilt: "2020",
      propertyType: "apartment",
      listingType: "sale",
      street: "123 Main St",
      city: "Lisbon",
      area: "Centro",
      postalCode: "1000-001",
      images: JSON.stringify([
        "https://public.example.com/tenant-42/listing-1.jpg",
      ]),
      amenities: JSON.stringify(["parking", "pool"]),
    });

    const result = await createListing(formData);

    expect(result).toEqual({ success: true });
    expect(mockGetCurrentTenant).toHaveBeenCalledTimes(1);

    expect(insertCalls.length).toBe(2);

    const [listingInsert, activityInsert] = insertCalls;
    expect(listingInsert.table).toBe(listing);

    type ListingInsertValues = {
      title: string;
      description: string | null;
      price: number;
      status: string;
      tenantId: string;
      images: string[] | null;
      features: {
        beds: number | null;
        baths: number | null;
        sqft: number | null;
        yearBuilt: number | null;
        propertyType: string;
        listingType: string;
        amenities: string[];
      };
      address: {
        street: string | null;
        city: string | null;
        area: string | null;
        postalCode: string | null;
      };
    };

    const listingValues = listingInsert.values as ListingInsertValues;

    expect(listingValues).toMatchObject({
      title: "Modern Loft",
      description: "Top-floor loft with city views",
      price: 250000,
      status: "PUBLISHED",
      tenantId: "tenant-42",
      images: ["https://public.example.com/tenant-42/listing-1.jpg"],
    });

    expect(listingValues.features).toMatchObject({
      beds: 2,
      baths: 1,
      sqft: 80,
      yearBuilt: 2020,
      propertyType: "apartment",
      listingType: "sale",
      amenities: ["parking", "pool"],
    });

    expect(listingValues.address).toMatchObject({
      street: "123 Main St",
      city: "Lisbon",
      area: "Centro",
      postalCode: "1000-001",
    });

    expect(activityInsert.table).toBe(activity);
    type ActivityInsertValues = {
      type: string;
      tenantId: string;
      metadata: { listingId: string; price: number };
    };

    const activityValues = activityInsert.values as ActivityInsertValues;

    expect(activityValues).toMatchObject({
      type: "LISTING_CREATED",
      tenantId: "tenant-42",
      metadata: { listingId: "listing-123", price: 250000 },
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/listings");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects submissions without a title or price before touching the database", async () => {
    const resultMissingTitle = await createListing(
      createFormData({ price: "100" }),
    );

    expect(resultMissingTitle).toEqual({
      success: false,
      error: "Title and price are required",
    });
    expect(insertCalls.length).toBe(0);

    const resultInvalidPrice = await createListing(
      createFormData({ title: "Test", price: "invalid" }),
    );

    expect(resultInvalidPrice).toEqual({
      success: false,
      error: "Invalid price",
    });
    expect(insertCalls.length).toBe(0);
  });
});

describe("dashboard actions - dismiss activity", () => {
  it("deletes a single activity by id", async () => {
    await dismissActivity("activity-1");

    expect(deleteCalls.length).toBe(1);
    expect(deleteCalls[0].table).toBe(activity);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

describe("dashboard actions - dismiss all activities", () => {
  it("deletes all activities for the current tenant", async () => {
    mockGetCurrentTenant.mockResolvedValue({ id: "tenant-99" });

    await dismissAllActivities();

    expect(deleteCalls.length).toBe(1);
    expect(deleteCalls[0].table).toBe(activity);
    expect(mockGetCurrentTenant).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
