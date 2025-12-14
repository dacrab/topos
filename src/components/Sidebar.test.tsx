import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";

vi.mock("@/components/Logo", () => ({
  Logo: () => <div data-testid="logo">LOGO</div>,
}));

vi.mock("@/components/LogoutButton", () => ({
  LogoutButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      logout
    </button>
  ),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderSidebar() {
    return render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>,
    );
  }

  it("renders the main menu and highlights the active dashboard link", () => {
    const { container } = renderSidebar();

    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByText("Common.mainMenu")).toBeInTheDocument();

    expect(screen.getByText("Common.dashboard")).toBeInTheDocument();
    expect(screen.getByText("Common.listings")).toBeInTheDocument();
    expect(screen.getByText("Common.transactions")).toBeInTheDocument();
    expect(screen.getByText("Common.contacts")).toBeInTheDocument();
    expect(screen.getByText("Common.settings")).toBeInTheDocument();

    const activeLink = screen.getByText("Common.dashboard").closest("a");
    expect(activeLink).not.toBeNull();
    expect(activeLink?.className).toContain("bg-secondary");

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("w-64");
  });

  it("toggles collapsed state and persists the preference", () => {
    const { container } = renderSidebar();

    const toggleButton = screen.getByRole("button", {
      name: "Collapse sidebar",
    });

    fireEvent.click(toggleButton);

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("w-16");
    expect(window.localStorage.getItem("sidebar-collapsed")).toBe("true");

    const { container: container2 } = renderSidebar();
    const root2 = container2.firstChild as HTMLElement;
    expect(root2.className).toContain("w-16");
  });
});
