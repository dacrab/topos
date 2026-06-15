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
    <div
      className={cn(
        "p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-card-hover transition-shadow",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground tracking-wide">{title}</h3>
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {Icon && (
          <div className="text-muted-foreground/30">
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
}

export function UsageStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 border border-border bg-card rounded-lg">
      <div className="text-xs text-muted-foreground tracking-wide mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
