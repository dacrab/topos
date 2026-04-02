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
          "relative flex items-center justify-center w-8 h-8 overflow-hidden shadow-sm",
          inverted ? "bg-background text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <title>{`${APP_CONFIG.name} Logo`}</title>
          <path
            d="M3 21L12 4L14.5 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            d="M21 21L12 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className="opacity-50"
          />
          <path d="M7.5 13H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
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
