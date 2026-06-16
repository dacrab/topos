import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  compact?: boolean;
}

export function Logo({ className, showText = true, inverted = false, compact = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg overflow-hidden",
          compact ? "w-7 h-7" : "w-9 h-9",
          inverted ? "bg-white/15 text-background" : "bg-primary text-primary-foreground",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={compact ? "w-4 h-4" : "w-5 h-5"}
        >
          <title>{`${APP_CONFIG.name} Logo`}</title>
          <path
            d="M3.5 9L12 3L20.5 9V18L12 22L3.5 18V9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 9L12 13L20.5 9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            compact ? "text-base" : "text-xl",
            inverted ? "text-background" : "text-foreground",
          )}
        >
          {APP_CONFIG.name}
        </span>
      )}
    </div>
  );
}
