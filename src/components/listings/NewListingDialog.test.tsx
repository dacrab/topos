import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div role="img" aria-label={alt} data-src={src} />
  ),
}));

vi.mock("@/app/(dashboard)/actions", () => ({ createListing: vi.fn() }));

import { NewListingDialog } from "./NewListingDialog";

describe("NewListingDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => "blob:mock");
    global.URL.revokeObjectURL = vi.fn();
    // Reset body styles left by Radix dialog between tests
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
});
