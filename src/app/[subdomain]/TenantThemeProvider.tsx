"use client";

import { type ReactNode, useEffect } from "react";
import type { TenantBranding } from "@/lib/types";

export function TenantThemeProvider({ children, branding }: { children: ReactNode; branding?: TenantBranding | null }) {
  useEffect(() => {
    if (!branding) return;
    const root = document.documentElement;
    if (branding.primary) root.style.setProperty("--primary", branding.primary);
    if (branding.accent) root.style.setProperty("--accent", branding.accent);
    if (branding.radius) root.style.setProperty("--radius", branding.radius);
  }, [branding]);

  return children;
}
