import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  compact?: boolean;
  /** Render the wordmark in the serif display face (marketing/public). */
  serif?: boolean;
}

/**
 * Topos Mark — horizon + sun + place.
 * A horizontal horizon line bisects a rising sun (a top-half arc) and a
 * downward placemark wedge. Sun above, place below. τόπος.
 */
function Mark({ compact }: { compact: boolean }) {
  const s = compact ? 14 : 22;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      aria-hidden="true"
    >
      {/* Sun — top semicircle arc rising above the horizon */}
      <path
        d="M8 12 A4 4 0 0 1 16 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Placemark wedge — filled triangle below the horizon */}
      <path d="M9 12 L15 12 L12 21 Z" fill="currentColor" />
      {/* Horizon line — painted last so it crisply bisects */}
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  inverted = false,
  compact = false,
  serif = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0",
          compact ? "w-7 h-7" : "w-9 h-9",
          inverted ? "text-background" : "text-primary",
        )}
      >
        <Mark compact={compact} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-sm" : "text-lg",
            serif ? "font-display" : "",
            inverted ? "text-background" : "text-foreground",
          )}
        >
          {APP_CONFIG.name}
        </span>
      )}
    </div>
  );
}
