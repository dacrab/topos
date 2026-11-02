import { isValidColor, isValidLength, readableForeground } from "./css-validation";
import type { TenantBranding } from "./types";

/** Builds the scoped CSS that applies a tenant's brand tokens to their site. */
export function tenantThemeCss(branding: TenantBranding | null | undefined): string {
  if (!branding) return "";

  const light = declarations({
    primary: branding.primary,
    accent: branding.accent ?? branding.primary,
    radius: branding.radius,
  });
  const dark = declarations({
    primary: branding.darkPrimary ?? branding.primary,
    accent: branding.darkAccent ?? branding.accent ?? branding.primary,
    radius: branding.radius,
  });

  const rules: string[] = [];
  if (light) rules.push(`.tenant-theme{${light}}`);
  if (dark) rules.push(`.dark .tenant-theme{${dark}}`);
  return rules.join("");
}

function declarations(input: {
  primary?: string | null | undefined;
  accent?: string | null | undefined;
  radius?: string | null | undefined;
}): string {
  const parts: string[] = [];

  if (isValidColor(input.primary)) {
    const primary = input.primary.trim();
    const foreground = readableForeground(primary);
    parts.push(`--primary:${primary}`, `--primary-foreground:${foreground}`, `--ring:${primary}`);
  }

  if (isValidColor(input.accent)) {
    const accent = input.accent.trim();
    parts.push(`--accent:${accent}`, `--accent-foreground:${readableForeground(accent)}`);
  }

  if (isValidLength(input.radius)) {
    parts.push(`--radius:${input.radius.trim()}`);
  }

  return parts.join(";");
}
