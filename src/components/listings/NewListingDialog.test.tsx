import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div role="img" aria-label={alt} data-src={src} />
  ),
}));

vi.mock("@/app/(dashboard)/actions", () => ({ createListing: vi.fn() }));

import { createListing } from "@/app/(dashboard)/actions";
import { NewListingDialog } from "./NewListingDialog";

describe("NewListingDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => "blob:mock");
    global.URL.revokeObjectURL = vi.fn();
    document.body.removeAttribute("data-scroll-locked");
    document.body.style.pointerEvents = "";
  });

  async function renderAndOpen() {
    const user = userEvent.setup();
    const result = render(<NewListingDialog />);
    await user.click(result.getByRole("button", { name: "Common.newListing" }));
    return { ...result, user };
  }

  it("shows all required form fields when open", async () => {
    await renderAndOpen();
    expect(screen.getByLabelText(/Listings.title/)).toBeRequired();
    expect(screen.getByLabelText(/Listings.price/)).toBeRequired();
    expect(screen.getByLabelText(/Listings.description/)).toBeInTheDocument();
    expect(screen.getByText(/Listings.images/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Listings.create" })).toBeInTheDocument();
  });

  it("submits normalized form data and uploaded image urls", async () => {
    const { user } = await renderAndOpen();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://cdn.test/listing.png" }),
    } as Response);
    vi.mocked(createListing).mockResolvedValue({ success: true } as Awaited<
      ReturnType<typeof createListing>
    >);

    await user.type(screen.getByLabelText("Listings.title *"), "Modern Loft");
    await user.type(screen.getByLabelText("Listings.price (€) *"), "250000");
    await user.type(screen.getByLabelText("Listings.description"), "Sunny listing");
    await user.selectOptions(screen.getByLabelText("Listings.propertyType"), "villa");
    await user.selectOptions(screen.getByLabelText("Listings.listingType"), "rent");
    await user.click(screen.getByRole("checkbox", { name: "Listings.amenityPool" }));

    const fileInput = document.querySelector('input[type="file"]');
    const image = new File(["img"], "listing.png", { type: "image/png" });
    if (!fileInput) throw new Error("File input not found");
    await user.upload(fileInput as HTMLInputElement, image);

    await user.click(screen.getByRole("button", { name: "Listings.create" }));

    await waitFor(() => expect(createListing).toHaveBeenCalledOnce());
    const formData = vi.mocked(createListing).mock.calls[0]?.[0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData?.get("title")).toBe("Modern Loft");
    expect(formData?.get("price")).toBe("250000");
    expect(formData?.get("listingType")).toBe("rent");
    expect(formData?.get("propertyType")).toBe("villa");
    expect(formData?.get("amenities")).toBe(JSON.stringify(["pool"]));
    expect(formData?.get("images")).toBe(JSON.stringify(["https://cdn.test/listing.png"]));
    expect(global.fetch).toHaveBeenCalledOnce();
  });

  it("renders an uploaded preview and can remove it before submit", async () => {
    const { user } = await renderAndOpen();
    const fileInput = document.querySelector('input[type="file"]');
    const image = new File(["img"], "listing.png", { type: "image/png" });
    if (!fileInput) throw new Error("File input not found");

    await user.upload(fileInput as HTMLInputElement, image);

    expect(screen.getByRole("img", { name: "Listing" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Listings.removeImage" }));
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});
