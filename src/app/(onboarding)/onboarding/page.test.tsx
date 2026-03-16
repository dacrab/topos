import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(onboarding)/onboarding/actions", () => ({
  completeOnboarding: vi.fn(),
}));

import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions";
import OnboardingPage from "@/app/(onboarding)/onboarding/page";

const mockComplete = completeOnboarding as ReturnType<typeof vi.fn>;
const mockToastError = (toast as unknown as { error: ReturnType<typeof vi.fn> }).error;

describe("OnboardingPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("auto-generates slug from agency name", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await user.type(screen.getByLabelText("Onboarding.agencyName"), "My Agency!");

    expect((screen.getByLabelText("Onboarding.subdomain") as HTMLInputElement).value).toBe(
      "my-agency",
    );
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await user.click(screen.getByRole("button", { name: "Onboarding.continue" }));
    expect(mockToastError).toHaveBeenCalledWith("Onboarding.agencyNameRequired");
  });

  it("completes onboarding flow", async () => {
    mockComplete.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<OnboardingPage />);

    await user.type(screen.getByLabelText("Onboarding.agencyName"), "Test Co");
    await user.click(screen.getAllByRole("button", { name: "Onboarding.continue" })[0]!);

    await waitFor(() =>
      expect(screen.getAllByText("Onboarding.officeTitle")[0]).toBeInTheDocument(),
    );

    await user.click(screen.getAllByRole("button", { name: "Onboarding.complete" })[0]!);

    expect(mockComplete).toHaveBeenCalled();
    expect(await screen.findByText("Onboarding.allSet")).toBeInTheDocument();
  });
});
