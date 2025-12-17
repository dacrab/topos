import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListingDetailDialog } from "./ListingDetailDialog";

// Mock next/image
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

// Mock icons to avoid rendering issues or large snapshots (optional but good practice)
vi.mock("lucide-react", () => ({
  MapPin: () => <span data-testid="icon-map-pin" />,
  Home: () => <span data-testid="icon-home" />,
  Bed: () => <span data-testid="icon-bed" />,
  Bath: () => <span data-testid="icon-bath" />,
  Maximize: () => <span data-testid="icon-maximize" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Car: () => <span data-testid="icon-car" />,
  Waves: () => <span data-testid="icon-waves" />,
  TreePine: () => <span data-testid="icon-tree-pine" />,
  Fence: () => <span data-testid="icon-fence" />,
  Zap: () => <span data-testid="icon-zap" />,
  Users: () => <span data-testid="icon-users" />,
  Dumbbell: () => <span data-testid="icon-dumbbell" />,
  Thermometer: () => <span data-testid="icon-thermometer" />,
  Wind: () => <span data-testid="icon-wind" />,
  Mountain: () => <span data-testid="icon-mountain" />,
  Building: () => <span data-testid="icon-building" />,
  ArrowUp: () => <span data-testid="icon-arrow-up" />,
  Shield: () => <span data-testid="icon-shield" />,
  Wifi: () => <span data-testid="icon-wifi" />,
  Warehouse: () => <span data-testid="icon-warehouse" />,
  Snowflake: () => <span data-testid="icon-snowflake" />,
  Sofa: () => <span data-testid="icon-sofa" />,
  PawPrint: () => <span data-testid="icon-paw-print" />,
  ShieldCheck: () => <span data-testid="icon-shield-check" />,
  X: () => <span data-testid="icon-x" />,
}));

describe("ListingDetailDialog", () => {
  const mockListing = {
    id: "123",
    title: "Luxury Villa",
    description: "A beautiful villa with sea view",
    price: 1000000,
    status: "PUBLISHED",
    images: ["/img1.jpg", "/img2.jpg"],
    features: {
      beds: 5,
      baths: 4,
      sqft: 500,
      yearBuilt: 2022,
      propertyType: "villa",
      listingType: "sale",
      amenities: ["parking", "pool"],
    },
    address: {
      street: "Ocean Blvd",
      city: "Miami",
      area: "South Beach",
      postalCode: "33139",
    },
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  };

  it("renders trigger and opens dialog with listing details", () => {
    render(
      <ListingDetailDialog
        listing={mockListing}
        trigger={<button type="button">View Details</button>}
      />,
    );

    // Click trigger
    fireEvent.click(screen.getByText("View Details"));

    // Check title
    expect(screen.getByText("Luxury Villa")).toBeInTheDocument();

    // Check price formatted (simple check for number presence or formatted string depending on locale)
    // The component uses toLocaleString(), so "1,000,000" or "1.000.000" or similar.
    // We can use a regex or partial match.
    expect(screen.getByText(/1.*000.*000/)).toBeInTheDocument();

    // Check address
    expect(screen.getAllByText(/Ocean Blvd/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Miami/).length).toBeGreaterThan(0);

    // Check features
    expect(screen.getByText("5")).toBeInTheDocument(); // Beds
    expect(screen.getByText("4")).toBeInTheDocument(); // Baths

    // Check description
    expect(
      screen.getByText("A beautiful villa with sea view"),
    ).toBeInTheDocument();

    // Check images rendered
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute("data-src", "/img1.jpg");
  });

  it("handles missing optional data gracefully", () => {
    const minimalListing = {
      ...mockListing,
      description: null,
      features: {},
      address: {},
      images: [],
    };

    render(
      <ListingDetailDialog
        listing={minimalListing}
        trigger={<button type="button">View</button>}
      />,
    );

    fireEvent.click(screen.getByText("View"));

    expect(screen.getByText("Luxury Villa")).toBeInTheDocument();
    // Should not crash
  });
});
