import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-muted-foreground",
        "border border-dashed border-border/60 rounded-2xl bg-muted/20",
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
      <div className="flex items-center gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
      </div>
      {description && (
        <p className="text-muted-foreground mt-1.5 text-sm max-w-prose">{description}</p>
      )}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-micro font-semibold text-muted-foreground tracking-wide-caps">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-border/50 p-4 rounded-2xl bg-muted/30">
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}
