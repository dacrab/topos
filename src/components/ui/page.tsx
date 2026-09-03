import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-muted-foreground",
        "border border-dashed border-border rounded-xl bg-muted/20 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="page-title text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm max-w-prose">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="label-caps">{title}</h3>
      {children}
    </div>
  );
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card-base p-5 bg-muted/30">
      <h4 className="label-caps mb-3">{title}</h4>
      {children}
    </div>
  );
}

/** Thin section divider with a heading — used to separate groups inside settings pages. */
export function DividerHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
