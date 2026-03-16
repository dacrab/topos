import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Page header for marketing pages
export function PageHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center mb-16", className)}>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">{title}</h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Section header for settings/dashboard
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

// Form section with h3 header
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
      <h3 className="text-sm font-semibold border-b border-border pb-2">{title}</h3>
      {children}
    </div>
  );
}

// Info box (used in settings forms)
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

// Marketing page container
export function MarketingContainer({
  children,
  maxWidth = "max-w-4xl",
  className,
}: {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}) {
  return (
    <div className={cn("py-20 md:py-28", className)}>
      <div className={cn("container mx-auto px-4", maxWidth)}>{children}</div>
    </div>
  );
}

// Content card (border box used everywhere)
export function ContentCard({
  children,
  className,
  inverted = false,
}: {
  children: ReactNode;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={cn(
        "border p-8",
        inverted
          ? "bg-foreground text-background border-foreground"
          : "bg-background border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
