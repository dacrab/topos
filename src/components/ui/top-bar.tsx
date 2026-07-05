import { cn } from "@/lib/utils";

type TopBarProps = {
  /** Gradient style. `accent` is the featured plan variant (from-accent via-primary to-brand). */
  variant?: "default" | "accent";
  /** Bar height. Defaults to "1.5". */
  height?: "1" | "1.5";
  className?: string;
};

/**
 * Reusable decorative gradient strip used at the top of cards, dialogs, and forms.
 * Default: subtle primary→accent→primary wash. Variant "accent": vivid accent→primary→brand.
 */
export function TopBar({ variant = "default", height = "1.5", className }: TopBarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "shrink-0",
        height === "1" ? "h-1" : "h-1.5",
        variant === "accent"
          ? "bg-gradient-to-r from-accent via-primary to-brand"
          : "bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20",
        className,
      )}
    />
  );
}
