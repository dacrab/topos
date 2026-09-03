import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({ title, value, subtitle, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("card-base p-6", "card-hover hover:border-primary/25", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
          <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function UsageStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-base rounded-lg p-4">
      <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
