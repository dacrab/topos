import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Label({ className, htmlFor, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is passed via props when needed, children are provided via props
  return <label className={cn("label-caps", className)} htmlFor={htmlFor} {...props} />;
}

export function ToggleItem({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between p-3 border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
      <div>
        <span className="text-sm font-medium">{label}</span>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-5 h-5 border-2 border-input bg-background"
      />
    </label>
  );
}

export function FormField({
  id,
  label,
  hint,
  children,
  className,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormGrid({
  children,
  cols = 2,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const colsClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const;
  return <div className={cn("grid gap-4", colsClass[cols], className)}>{children}</div>;
}

export function FormSubmitButton({
  isPending,
  idleLabel,
  pendingLabel,
  className,
}: {
  isPending: boolean;
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  return (
    <Button type="submit" variant="submit" size="auto" disabled={isPending} className={className}>
      {isPending ? pendingLabel : idleLabel}
    </Button>
  );
}
