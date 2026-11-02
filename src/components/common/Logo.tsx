import type { CSSProperties } from "react";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  compact?: boolean;
  tagline?: string;
};

/**
 * Topos mark — a plot (square), a T (the plan), and an oxide-red survey point.
 * It reads as a land registry stamp rather than a generic location pin.
 */
function Mark({ compact, inverted }: { compact: boolean; inverted: boolean }) {
  const size = compact ? 22 : 28;
  const style = {
    "--mark-bg": inverted ? "var(--background)" : "var(--foreground)",
    "--mark-fg": inverted ? "var(--foreground)" : "var(--background)",
    "--mark-accent": "var(--accent)",
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className="shrink-0"
      style={style}
    >
      <rect width="32" height="32" fill="var(--mark-bg)" />
      <path d="M7 7.5h18v3.4H17.7V24h-3.4V10.9H7z" fill="var(--mark-fg)" />
      <rect x="23.5" y="23.5" width="4" height="4" fill="var(--mark-accent)" />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  inverted = false,
  compact = false,
  tagline,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark compact={compact} inverted={inverted} />
      {showText && (
        <span className="flex flex-col justify-center gap-1">
          <span
            className={cn(
              "font-display leading-none tracking-[-0.02em]",
              compact ? "text-[1.05rem]" : "text-[1.35rem]",
              inverted ? "text-background" : "text-foreground",
            )}
          >
            {APP_CONFIG.name}
          </span>
          {tagline && (
            <span
              className={cn(
                "font-mono text-[0.5625rem] uppercase leading-none tracking-[0.2em]",
                inverted ? "text-background/55" : "text-muted-foreground",
              )}
            >
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
