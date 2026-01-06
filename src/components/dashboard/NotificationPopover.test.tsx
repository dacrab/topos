import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(dashboard)/actions", () => ({
  dismissActivity: vi.fn(),
  dismissAllActivities: vi.fn(),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { dismissActivity, dismissAllActivities } from "@/app/(dashboard)/actions";
import { NotificationPopover } from "@/components/dashboard/NotificationPopover";

const activities = [
  {
    id: "a1",
    type: "LISTING_CREATED",
    title: "New listing",
    description: "Loft",
    metadata: null,
    tenantId: "t1",
    userId: null,
    listingId: null,
    contactId: null,
    createdAt: new Date(),
  },
  {
    id: "a2",
    type: "NEW_LEAD",
    title: "New lead",
    description: "John",
    metadata: null,
    tenantId: "t1",
    userId: null,
    listingId: null,
    contactId: null,
    createdAt: new Date(),
  },
];

describe("NotificationPopover", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows badge count and dismisses single activity", async () => {
    const user = userEvent.setup();
    render(<NotificationPopover activities={activities} />);

    expect(screen.getByText("2")).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", {
      name: "Dashboard.dismissNotification",
    });
    const firstButton = closeButtons[0];
    if (firstButton) await user.click(firstButton);

    await waitFor(() => expect(dismissActivity).toHaveBeenCalledWith("a1"));
  });

  it("clears all activities", async () => {
    const user = userEvent.setup();
    render(<NotificationPopover activities={activities} />);

    await user.click(screen.getByRole("button", { name: /Dashboard.clearAll/i }));

    await waitFor(() => expect(dismissAllActivities).toHaveBeenCalled());
  });
});
