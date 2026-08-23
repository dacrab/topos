"use client";

import { type ReactNode, useEffect } from "react";
import { isValidColor, isValidLength } from "@/lib/css-validation";
import type { TenantBranding } from "@/lib/types";

function applyBranding(branding: TenantBranding) {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");

  const primary = isDark ? (branding.darkPrimary ?? branding.primary) : branding.primary;
  const accent = isDark ? (branding.darkAccent ?? branding.accent) : branding.accent;

  if (primary && isValidColor(primary)) {
    const v = primary.trim();
    root.style.setProperty("--primary", v);
    root.style.setProperty("--ring", v);
    root.style.setProperty("--brand", v);
  }
  if (accent && isValidColor(accent)) {
    root.style.setProperty("--accent", accent.trim());
  }
  if (branding.radius && isValidLength(branding.radius)) {
    root.style.setProperty("--radius", branding.radius.trim());
  }
}

function clearBranding() {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--brand");
  root.style.removeProperty("--accent");
  root.style.removeProperty("--radius");
}

export function SiteContent({
  children,
  branding,
}: {
  children: ReactNode;
  branding?: TenantBranding | null | undefined;
}) {
  useEffect(() => {
    if (!branding) {
      clearBranding();
      return;
    }

    applyBranding(branding);

    // Re-apply when dark mode toggles
    const observer = new MutationObserver(() => applyBranding(branding));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      clearBranding();
    };
  }, [branding]);

  return <>{children}</>;
}
