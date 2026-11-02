import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-12 text-center text-sm text-muted-foreground",
        "rounded-[2px] border border-dashed border-foreground/25 bg-transparent",
        className,
      )}
    >
      {icon && (
        <span className="flex h-10 w-10 items-center justify-center border border-border bg-card text-accent">
          {icon}
        </span>
      )}
      <div className="max-w-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string | undefined;
  eyebrow?: string | undefined;
  children?: ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col gap-4 border-b-2 border-foreground/85 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="chip-eyebrow mb-2.5">{eyebrow}</p>}
        <h1 className="page-title text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/** A bordered surface with an optional heading — the base for settings and data panels. */
export function Panel({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string | undefined;
  description?: string | undefined;
  icon?: ReactNode | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <section className={cn("rounded-[2px] border border-border bg-card", className)}>
      {(title || action) && (
        <header className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-border text-accent">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-lg leading-tight tracking-[-0.01em] text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Wraps a data table in the shared card + horizontal scroll shell. */
export function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[2px] border border-border bg-card", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string | undefined;
  icon?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <Panel
      title={title}
      {...(description ? { description } : {})}
      {...(icon ? { icon } : {})}
      className={className}
      bodyClassName={cn("space-y-5", bodyClassName)}
    >
      {children}
    </Panel>
  );
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-accent bg-muted/40 p-4">
      <h4 className="label-caps mb-2">{title}</h4>
      {children}
    </div>
  );
}

/** Thin section divider with a heading — used to separate groups inside pages. */
export function DividerHeading({
  title,
  icon,
  className,
}: {
  title: string;
  icon?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <h3 className="flex items-center gap-1.5 meta-caps font-medium text-muted-foreground">
        {icon}
        {title}
      </h3>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
