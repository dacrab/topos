import { fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions";
import OnboardingPage from "@/app/(onboarding)/onboarding/page";

vi.mock("@/app/(onboarding)/onboarding/actions", () => ({
  completeOnboarding: vi.fn(),
}));

const mockCompleteOnboarding = completeOnboarding as unknown as ReturnType<
  typeof vi.fn
>;

const mockToastError = (toast as unknown as { error: Mock }).error;

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-generates a slug from the agency name", () => {
    render(<OnboardingPage />);

    const agencyInput = screen.getByLabelText("Onboarding.agencyName");
    const slugInput = screen.getByLabelText("Onboarding.subdomain");

    fireEvent.change(agencyInput, {
      target: { value: "My Awesome Agency!" },
    });

    expect((slugInput as HTMLInputElement).value).toBe("my-awesome-agency");
  });

  it("validates required fields and shows translated error messages", () => {
    render(<OnboardingPage />);

    const continueButton = screen.getByRole("button", {
      name: "Onboarding.continue",
    });

    fireEvent.click(continueButton);

    expect(mockToastError).toHaveBeenCalledWith(
      "Onboarding.agencyNameRequired",
    );

    const agencyInput = screen.getByLabelText("Onboarding.agencyName");
    fireEvent.change(agencyInput, { target: { value: "Acme Realty" } });

    const slugInput = screen.getByLabelText("Onboarding.subdomain");
    fireEvent.change(slugInput, { target: { value: "   " } });

    fireEvent.click(continueButton);

    expect(mockToastError).toHaveBeenCalledWith("Onboarding.slugRequired");
  });

  it("submits office details and moves to the completion step when onboarding succeeds", async () => {
    mockCompleteOnboarding.mockResolvedValue({
      success: true,
      message: "Onboarding completed",
    });

    render(<OnboardingPage />);

    const agencyInput = screen.getByLabelText("Onboarding.agencyName");
    const slugInput = screen.getByLabelText("Onboarding.subdomain");

    fireEvent.change(agencyInput, { target: { value: "Green Valley" } });
    fireEvent.change(slugInput, { target: { value: "green-valley" } });

    const continueButton = screen.getByRole("button", {
      name: "Onboarding.continue",
    });
    fireEvent.click(continueButton);

    expect(screen.getByText("Onboarding.officeTitle")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Onboarding.phone"), {
      target: { value: "+123456789" },
    });
    fireEvent.change(screen.getByLabelText("Onboarding.email"), {
      target: { value: "office@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Onboarding.website"), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByLabelText("Onboarding.address"), {
      target: { value: "123 Main St" },
    });

    const completeButton = screen.getByRole("button", {
      name: "Onboarding.complete",
    });
    fireEvent.click(completeButton);

    expect(mockCompleteOnboarding).toHaveBeenCalledWith({
      agencyName: "Green Valley",
      slug: "green-valley",
      phone: "+123456789",
      email: "office@example.com",
      address: "123 Main St",
      website: "https://example.com",
    });

    expect(await screen.findByText("Onboarding.allSet")).toBeInTheDocument();
  });
});
