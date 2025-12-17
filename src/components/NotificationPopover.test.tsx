import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotificationPopover } from "@/components/NotificationPopover";

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: Date | string;
};

type NotificationPopoverProps = {
  activities: Activity[];
  dismissActivity: (id: string) => Promise<void>;
  dismissAllActivities: () => Promise<void>;
};

// Flatten the popover primitives so content is always rendered in tests
vi.mock("@/components/ui/popover", () => {
  const React = require("react");
  return {
    Popover: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    PopoverContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

describe("NotificationPopover", () => {
  const baseActivities = [
    {
      id: "a1",
      type: "LISTING_CREATED",
      title: "New listing added",
      description: "Loft in Lisbon",
      createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
    },
    {
      id: "a2",
      type: "NEW_LEAD",
      title: "New lead",
      description: "John Doe registered",
      createdAt: new Date("2024-01-01T11:00:00Z").toISOString(),
    },
  ];

  function setup(props: NotificationPopoverProps) {
    const user = userEvent.setup();
    render(<NotificationPopover {...props} />);
    return { user };
  }

  it("shows an unread badge with the number of activities", () => {
    const dismissActivity = vi.fn(async () => {});
    const dismissAllActivities = vi.fn(async () => {});

    setup({
      activities: baseActivities,
      dismissActivity,
      dismissAllActivities,
    });

    // Badge should show the raw count (2) because it is below 9+
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("dismisses a single activity optimistically and calls the server action", async () => {
    const dismissActivity = vi.fn(async () => {});
    const dismissAllActivities = vi.fn(async () => {});

    const { user } = setup({
      activities: baseActivities,
      dismissActivity,
      dismissAllActivities,
    });

    // Two rows rendered initially
    expect(screen.getAllByText(/New listing added|New lead/)).toHaveLength(2);

    // Click the close button for the first activity
    const closeButtons = screen.getAllByRole("button", {
      name: "Dashboard.dismissNotification",
    });

    await user.click(closeButtons[0]);

    // Optimistic update should hide one of the activities immediately
    expect(screen.getAllByText(/New listing added|New lead/)).toHaveLength(1);

    // Wait for the transition callback to flush and call the server action
    await waitFor(() => {
      expect(dismissActivity).toHaveBeenCalledWith("a1");
    });
    expect(dismissAllActivities).not.toHaveBeenCalled();
  });

  it("clears all activities and calls dismissAllActivities", async () => {
    const dismissActivity = vi.fn(async () => {});
    const dismissAllActivities = vi.fn(async () => {});

    const { user } = setup({
      activities: baseActivities,
      dismissActivity,
      dismissAllActivities,
    });

    expect(screen.getByText("Dashboard.recentActivity")).toBeInTheDocument();

    const clearAllButton = screen.getByRole("button", { name: /Clear all/i });
    await user.click(clearAllButton);

    // All activities cleared locally
    expect(screen.getByText("No notifications")).toBeInTheDocument();

    await waitFor(() => {
      expect(dismissAllActivities).toHaveBeenCalledTimes(1);
    });
    expect(dismissActivity).not.toHaveBeenCalled();
  });
});
