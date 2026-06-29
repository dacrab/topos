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
 * Topos Mark — a placemark form.
 * A downward wedge (the universal "you are here" glyph) seated on a
 * horizontal baseline, inside a clean frame. The wedge narrows to a
 * point — place located, grounded, precise. The baseline is the ground.
 * Together they say: this is the place. τόπος.
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
      {/* Frame — open at bottom, suggesting grounded structure */}
      <path
        d="M3 3H21V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Placemark wedge — narrows downward to a point */}
      <path d="M12 5.5L16.5 11.5H7.5L12 5.5Z" fill="currentColor" />
      {/* Ground line — the baseline / foundation */}
      <path d="M3 16H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Point below — the precise location */}
      <circle cx="12" cy="20" r="1.4" fill="currentColor" />
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
