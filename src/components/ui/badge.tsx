import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
};

const variantStyles = {
  default: "bg-muted text-foreground border-border/40",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  destructive: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 border",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
