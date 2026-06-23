import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "brand" | "outline";
  className?: string;
};

const variantStyles = {
  default: "bg-secondary text-secondary-foreground border border-border/60",
  primary: "bg-primary/10 text-primary border border-primary/20",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20",
  brand: "bg-brand/15 text-brand border border-brand/25",
  outline: "bg-transparent text-muted-foreground border border-border",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
