import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input, Textarea } from "./input";
import { Switch } from "./switch";

export function Label({
  className,
  htmlFor,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  );
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
    <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-card hover:bg-accent/5 transition-colors shadow-card">
      <div className="space-y-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch name={name} defaultChecked={defaultChecked} />
    </div>
  );
}

export function FormField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  name,
  required,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {type === "textarea" ? (
        <Textarea id={name} name={name} required={required} {...props} />
      ) : (
        <Input id={name} name={name} type={type} required={required} {...props} />
      )}
    </div>
  );
}

export function FormSubmitButton({
  isPending,
  pendingLabel,
  idleLabel,
}: {
  isPending: boolean;
  pendingLabel: string;
  idleLabel: string;
}) {
  return (
    <Button type="submit" variant="submit" size="submit" disabled={isPending}>
      {isPending ? pendingLabel : idleLabel}
    </Button>
  );
}
