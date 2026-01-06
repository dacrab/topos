import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Stat card for dashboard metrics
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-8 border-r border-b border-border bg-card hover:bg-secondary/20 transition-colors group relative",
        className,
      )}
    >
      {Icon && (
        <div className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-foreground/20 transition-colors">
          <Icon className="w-12 h-12" />
        </div>
      )}
      <div className="flex flex-col h-full justify-between space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </h3>
        <div>
          <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
            {value}
          </div>
          {subtitle && (
            <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs font-mono">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick stat item (smaller version)
export function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-6 border-b border-border last:border-b-0 hover:bg-secondary/10 transition-colors">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <div className="text-3xl font-mono font-bold">{value}</div>
    </div>
  );
}
