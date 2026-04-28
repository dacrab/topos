import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

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

export function FormField({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

export function FormSubmitButton({ isPending, pendingLabel, idleLabel }: { isPending: boolean; pendingLabel: string; idleLabel: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="bg-primary text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50"
    >
      {isPending ? pendingLabel : idleLabel}
    </button>
  );
}
