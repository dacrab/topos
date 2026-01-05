import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div role="img" aria-label={alt} data-src={src} />
  ),
}));

vi.mock("@/app/(dashboard)/actions", () => ({ createListing: vi.fn() }));

import { createListing } from "@/app/(dashboard)/actions";
import { NewListingDialog } from "./NewListingDialog";

const mockCreateListing = createListing as ReturnType<typeof vi.fn>;

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => "blob:mock");
global.URL.revokeObjectURL = vi.fn();

describe("NewListingDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens dialog and validates required fields", async () => {
    const user = userEvent.setup();
    render(<NewListingDialog />);

    await user.click(screen.getByText("Common.newListing"));

    expect(screen.getByLabelText(/Listings.title/)).toBeRequired();
    expect(screen.getByLabelText(/Listings.price/)).toBeRequired();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    render(<NewListingDialog />);

    await user.click(screen.getByText("Common.newListing"));
    await user.type(screen.getByLabelText(/Listings.title/), "Test House");
    await user.type(screen.getByLabelText(/Listings.price/), "500000");

    mockCreateListing.mockResolvedValue({ success: true });
    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => expect(mockCreateListing).toHaveBeenCalled());

    const formData = mockCreateListing.mock.calls[0][0] as FormData;
    expect(formData.get("title")).toBe("Test House");
  });

  it("shows error on failure", async () => {
    const user = userEvent.setup();
    render(<NewListingDialog />);

    await user.click(screen.getByText("Common.newListing"));
    await user.type(screen.getByLabelText(/Listings.title/), "Fail");
    await user.type(screen.getByLabelText(/Listings.price/), "100");

    mockCreateListing.mockResolvedValue({ success: false, error: "DB error" });
    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("DB error"));
  });
});
