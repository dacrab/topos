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
    <div className={cn("group relative bg-background px-4 py-5 sm:px-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="meta-caps font-medium text-muted-foreground">{title}</h3>
          <div className="font-display text-[2rem] leading-none tracking-[-0.03em] text-foreground tabular-nums">
            {value}
          </div>
          {subtitle && <div className="pt-1 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-accent transition-colors group-hover:border-foreground/40">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

export function UsageStat({
  label,
  value,
  progress,
}: {
  label: string;
  value: string | number;
  progress?: number | undefined;
}) {
  return (
    <div className="border-l border-border pl-4 first:border-l-0 first:pl-0">
      <div className="meta-caps text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-display text-xl tabular-nums text-foreground">{value}</div>
      {progress !== undefined && (
        <div className="mt-3 h-1 overflow-hidden bg-muted">
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
