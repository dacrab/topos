import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-muted-foreground rounded-xl bg-muted/20",
        "border border-dashed border-border/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-2">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-1.5 text-sm max-w-prose">{description}</p>
      )}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.14em]">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-border/50 p-4 rounded-lg bg-muted/30">
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}
