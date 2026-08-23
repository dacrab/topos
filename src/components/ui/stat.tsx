import type { LucideIcon } from "lucide-react";
import { CardStripe } from "@/components/ui/stripe";
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
        "relative bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-inset ring-border/40",
        "card-hover hover:shadow-card-hover",
        className,
      )}
    >
      <CardStripe tone="gradient" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
            <div className="text-3xl font-display font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </div>
            {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
          </div>
          {Icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UsageStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border/40 bg-card rounded-2xl overflow-hidden shadow-card">
      <CardStripe tone="gradient" thin />
      <div className="p-4">
        <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
        <div className="text-xl font-semibold font-display tabular-nums text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
