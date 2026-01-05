"use client";

import * as React from "react";

interface Branding {
  primary?: string;
  accent?: string;
  radius?: string;
  // Add mapping for complex shadcn variables if needed
}

interface TenantThemeProviderProps {
  children: React.ReactNode;
  branding?: unknown;
}

export function TenantThemeProvider({
  children,
  branding,
}: TenantThemeProviderProps) {
  React.useEffect(() => {
    const b = branding as Branding | null | undefined;
    if (b) {
      const root = document.documentElement;

      // Helper to convert hex to hsl if needed by shadcn, but shadcn 4+ might use hex or hsl
      // Assuming branding stores HSL or HEX. Shadcn usually uses HSL values without 'hsl()'.
      // For simplicity, let's assume we update the CSS vars directly.
      // If using shadcn default css variables (e.g. --primary: 222.2 47.4% 11.2%;), we need to store that format.

      // Strategy: Store valid CSS value.

      if (b.primary) {
        // Example: branding.primary = "210 100% 50%"
        root.style.setProperty("--primary", b.primary);
      }

      if (b.accent) {
        root.style.setProperty("--accent", b.accent);
      }

      if (b.radius) {
        root.style.setProperty("--radius", b.radius);
      }
    }
  }, [branding]);

  return <>{children}</>;
}
