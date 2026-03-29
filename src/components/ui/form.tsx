import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

// Toggle item for notification-style checkboxes
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

// Form field wrapper with label
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

const COLS_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

// Grid for form fields
export function FormGrid({
  children,
  cols = 2,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  return <div className={cn("grid gap-4", COLS_CLASS[cols], className)}>{children}</div>;
}
