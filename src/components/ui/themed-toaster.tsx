"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/** Sonner has no CSS-var theme — bridge it to next-themes. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        style: {
          borderRadius: "2px",
          border: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--foreground)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.8125rem",
        },
      }}
    />
  );
}
