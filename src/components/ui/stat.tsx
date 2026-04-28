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
        <h3 className="label-caps">{title}</h3>
        <div>
          <div className="text-5xl font-mono font-medium tracking-tighter text-foreground">
            {value}
          </div>
          {subtitle && (
            <div className="mt-2 text-muted-foreground text-xs font-mono">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}
