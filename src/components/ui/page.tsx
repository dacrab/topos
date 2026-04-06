import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  bordered = false,
  className,
}: {
  title: string;
  description?: string;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(bordered && "border-b border-border pb-4", className)}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
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
    <div className={cn("space-y-8", className)}>
      <SectionHeader title={title} bordered {...(description && { description })} />
      {children}
    </div>
  );
}

export function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

export function InfoBox({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("info-box", className)}>
      <h3 className="label-caps">{title}</h3>
      {children}
    </div>
  );
}

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("empty-state", className)}>{children}</div>;
}
