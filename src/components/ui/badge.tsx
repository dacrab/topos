import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "outline";
  className?: string;
};

const variantStyles = {
  default: "border-border bg-secondary/70 text-secondary-foreground",
  primary: "border-foreground bg-foreground text-background",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  outline: "border-border bg-transparent text-muted-foreground",
};

/** A small registry tag: rectangular, mono, uppercase. Deliberately not a pill. */
export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-0.5 font-mono text-[0.625rem] font-medium uppercase leading-4 tracking-[0.1em]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
