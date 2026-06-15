import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
};

const variantStyles = {
  default: "bg-muted text-foreground border-transparent",
  primary: "bg-primary/10 text-primary border-transparent",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-transparent",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-transparent",
  destructive: "bg-red-500/10 text-red-700 dark:text-red-400 border-transparent",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-md border",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
