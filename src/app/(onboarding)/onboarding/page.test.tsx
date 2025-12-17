import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  function setup() {
    const user = userEvent.setup();
    render(<OnboardingPage />);
    return { user };
  }

  it("auto-generates a slug from the agency name", async () => {
    const { user } = setup();

    const agencyInput = screen.getByLabelText("Onboarding.agencyName");
    const slugInput = screen.getByLabelText("Onboarding.subdomain");

    await user.type(agencyInput, "My Awesome Agency!");

    expect((slugInput as HTMLInputElement).value).toBe("my-awesome-agency");
  });

  it("validates required fields and shows translated error messages", async () => {
    const { user } = setup();

    const continueButton = screen.getByRole("button", {
      name: "Onboarding.continue",
    });

    await user.click(continueButton);

    expect(mockToastError).toHaveBeenCalledWith(
      "Onboarding.agencyNameRequired",
    );

    const agencyInput = screen.getByLabelText("Onboarding.agencyName");
    await user.type(agencyInput, "Acme Realty");

    const slugInput = screen.getByLabelText("Onboarding.subdomain");
    await user.clear(slugInput);
    await user.type(slugInput, "   ");

    await user.click(continueButton);

    expect(mockToastError).toHaveBeenCalledWith("Onboarding.slugRequired");
  });

  it("submits office details and moves to the completion step when onboarding succeeds", async () => {
    mockCompleteOnboarding.mockResolvedValue({
      success: true,
      message: "Onboarding completed",
    });

    const { user } = setup();

    const agencyInput = screen.getByLabelText("Onboarding.agencyName");
    const slugInput = screen.getByLabelText("Onboarding.subdomain");

    await user.type(agencyInput, "Green Valley");

    // Explicitly check current value before potentially redundant typing or verification
    expect((slugInput as HTMLInputElement).value).toBe("green-valley");

    const continueButton = screen.getByRole("button", {
      name: "Onboarding.continue",
    });
    await user.click(continueButton);

    expect(screen.getByText("Onboarding.officeTitle")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Onboarding.phone"), "+123456789");
    await user.type(
      screen.getByLabelText("Onboarding.email"),
      "office@example.com",
    );
    await user.type(
      screen.getByLabelText("Onboarding.website"),
      "https://example.com",
    );
    await user.type(screen.getByLabelText("Onboarding.address"), "123 Main St");

    const completeButton = screen.getByRole("button", {
      name: "Onboarding.complete",
    });
    await user.click(completeButton);

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
