import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";
import { NewListingDialog } from "./NewListingDialog";

// Mock next/image to avoid DOM warnings
type ImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  unoptimized?: boolean;
  className?: string;
  [key: string]: unknown;
};

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill,
    unoptimized,
    className,
    ...props
  }: ImageProps) => (
    <div
      role="img"
      aria-label={alt}
      data-src={src}
      data-alt={alt}
      data-fill={fill ? "true" : undefined}
      data-unoptimized={unoptimized ? "true" : undefined}
      className={className}
      {...props}
    />
  ),
}));

// Mock API for image upload
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

describe("NewListingDialog", () => {
  const mockCreateListing = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    const user = userEvent.setup();
    const { container } = render(
      <NewListingDialog createListing={mockCreateListing} />,
    );
    return { user, container };
  }

  it("opens dialog and renders form fields", async () => {
    const { user } = setup();

    await user.click(screen.getByText("Common.newListing"));

    expect(screen.getByText("Listings.createListing")).toBeInTheDocument();
    expect(screen.getByLabelText(/Listings.title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Listings.price/)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Common.newListing"));

    expect(screen.getByLabelText(/Listings.title/)).toBeRequired();
    expect(screen.getByLabelText(/Listings.price/)).toBeRequired();
  });

  it("submits form with valid data", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Common.newListing"));

    await user.type(screen.getByLabelText(/Listings.title/), "Test House");
    await user.type(screen.getByLabelText(/Listings.price/), "500000");
    await user.type(screen.getByLabelText(/Listings.beds/), "3");

    mockCreateListing.mockResolvedValue({ success: true });

    // Directly submit the form to bypass button/click issues in JSDOM
    // Use document.querySelector because Dialog renders in a Portal
    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockCreateListing).toHaveBeenCalled();
    });

    const formData = mockCreateListing.mock.calls[0][0] as FormData;
    expect(formData.get("title")).toBe("Test House");
    expect(formData.get("price")).toBe("500000");
    expect(formData.get("beds")).toBe("3");
  });

  it("handles image selection and upload during submission", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Common.newListing"));

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://example.com/image.jpg" }),
    } as Response);

    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });

    // Find the hidden input
    const fileInput = document.getElementById(
      "listing-images",
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    await user.upload(fileInput, file);

    expect(
      screen.getByRole("img", { name: "Listing image" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Listings.title/), "Image House");
    await user.type(screen.getByLabelText(/Listings.price/), "100");

    mockCreateListing.mockResolvedValue({ success: true });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/upload", expect.anything());
    });

    await waitFor(() => {
      expect(mockCreateListing).toHaveBeenCalled();
    });

    const formData = mockCreateListing.mock.calls[0][0] as FormData;
    const imagesStr = formData.get("images") as string;
    expect(imagesStr).toContain("https://example.com/image.jpg");
  });

  it("displays error message on failure", async () => {
    const { user } = setup();
    await user.click(screen.getByText("Common.newListing"));

    await user.type(screen.getByLabelText(/Listings.title/), "Fail House");
    await user.type(screen.getByLabelText(/Listings.price/), "100");

    mockCreateListing.mockResolvedValue({
      success: false,
      error: "Database error",
    });

    const form = document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockCreateListing).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Database error");
    });
  });
});
