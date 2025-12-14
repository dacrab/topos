import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Basic Next.js / router mocks for component tests
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  default: (props: {
    href?: string;
    className?: string;
    title?: string;
    children?: React.ReactNode;
  }) =>
    React.createElement(
      "a",
      {
        href: props.href,
        className: props.className,
        title: props.title,
      },
      props.children,
    ),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));
