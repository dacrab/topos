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

function ArchMark({ compact }: { compact: boolean }) {
  const s = compact ? 14 : 20;
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width={s} height={s}>
      <title>{`${APP_CONFIG.name} Logo`}</title>
      {/* Cycladic arch — the iconic whitewashed arched doorway of the islands,
          framing a rising sun / horizon line. */}
      {/* Arch outer */}
      <path
        d="M3 21V8C3 4.686 7.03 2 12 2C16.97 2 21 4.686 21 8V21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Horizon / sea line */}
      <path
        d="M3 13C7 16 17 16 21 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sun circle */}
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      {/* Sun rays */}
      <path d="M12 5.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 13.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 10H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Steps / base */}
      <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
          "relative flex items-center justify-center overflow-hidden shrink-0",
          compact ? "w-7 h-7" : "w-9 h-9",
          !compact && "rounded-xl",
          inverted ? "text-background" : "text-primary",
        )}
      >
        <ArchMark compact={compact} />
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
