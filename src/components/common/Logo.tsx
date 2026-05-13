import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
}

export function Logo({ className, showText = true, inverted = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center w-8 h-8",
          inverted ? "bg-background text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <title>{`${APP_CONFIG.name} Logo`}</title>
          {/* Geometric T + pin/place mark */}
          <rect x="4" y="4" width="16" height="3" fill="currentColor" />
          <rect x="10" y="4" width="4" height="14" fill="currentColor" />
          <rect x="8" y="18" width="8" height="2" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold text-xl tracking-tighter",
            inverted ? "text-background" : "text-foreground",
          )}
        >
          {APP_CONFIG.name.toUpperCase()}
        </span>
      )}
    </div>
  );
}
