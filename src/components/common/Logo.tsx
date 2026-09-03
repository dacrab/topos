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
 * Topos Mark — the "T-pin".
 * A location pin drawn from the letter T: the crossbar is the pin's crown,
 * the stem tapers to a point. Place, made structural. τόπος.
 */
function Mark({ compact, inverted }: { compact: boolean; inverted?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={compact ? 18 : 24}
      height={compact ? 18 : 24}
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="7" fill={inverted ? "#fcfcfb" : "currentColor"} />
      <path
        d="M16 8.5 V21"
        stroke={inverted ? "#0d5c6b" : "#fcfcfb"}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M10 10.5 H22"
        stroke={inverted ? "#0d5c6b" : "#fcfcfb"}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M11.8 19.2 L16 25.5 L20.2 19.2 Z" fill={inverted ? "#0d5c6b" : "#fcfcfb"} />
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
    <div className={cn("flex items-center gap-2.5", compact ? "gap-2" : "gap-2.5", className)}>
      <div className={inverted ? "" : "text-primary"}>
        <Mark compact={compact} inverted={inverted} />
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
