import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

export function SettingsPageSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <SectionHeader title={title} description={description} />
      {children}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-border p-4 bg-muted/30">
      <h4 className="text-xs font-bold uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}
