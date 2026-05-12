import { describe, expect, it, vi } from "vitest";

// Mock dependencies before importing actions
vi.mock("@/lib/currentTenant", () => ({
  getCurrentTenant: vi.fn(() => ({ id: "tenant-1", slug: "test" })),
}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("listing actions", () => {
  it("createListing is a function", async () => {
    const { createListing } = await import("@/app/(dashboard)/actions");
    expect(typeof createListing).toBe("function");
  });

  it("deleteListing is a function", async () => {
    const { deleteListing } = await import("@/app/(dashboard)/actions");
    expect(typeof deleteListing).toBe("function");
  });

  it("toggleListingStatus is a function", async () => {
    const { toggleListingStatus } = await import("@/app/(dashboard)/actions");
    expect(typeof toggleListingStatus).toBe("function");
  });
});

describe("contact actions", () => {
  it("createContact is a function", async () => {
    const { createContact } = await import("@/app/(dashboard)/contacts/actions");
    expect(typeof createContact).toBe("function");
  });

  it("listContacts is a function", async () => {
    const { listContacts } = await import("@/app/(dashboard)/contacts/actions");
    expect(typeof listContacts).toBe("function");
  });
});
