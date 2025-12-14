import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

function SidebarConsumer({
  onRender,
}: {
  onRender: (value: ReturnType<typeof useSidebar>) => void;
}) {
  const ctx = useSidebar();
  onRender(ctx);
  return <div>sidebar-consumer</div>;
}

describe("SidebarContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("throws when useSidebar is used outside of a provider", () => {
    const onRender = () => {};
    expect(() => render(<SidebarConsumer onRender={onRender} />)).toThrow(
      /useSidebar must be used within a SidebarProvider/,
    );
  });

  it("initializes collapsed state from localStorage and persists changes", async () => {
    window.localStorage.setItem("sidebar-collapsed", "true");

    let lastValue: ReturnType<typeof useSidebar> | null = null;

    render(
      <SidebarProvider>
        <SidebarConsumer
          onRender={(value) => {
            lastValue = value;
          }}
        />
      </SidebarProvider>,
    );

    await waitFor(() => {
      expect(lastValue).not.toBeNull();
      expect(lastValue?.isCollapsed).toBe(true);
    });

    await act(async () => {
      lastValue?.toggle();
    });

    expect(window.localStorage.getItem("sidebar-collapsed")).toBe("false");

    await act(async () => {
      lastValue?.setCollapsed(true);
    });

    expect(window.localStorage.getItem("sidebar-collapsed")).toBe("true");
  });
});
