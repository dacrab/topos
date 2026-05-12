import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input, Select, Textarea } from "./input";

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
        {label} {required && "*"}
      </Label>
      {type === "textarea" ? (
        <Textarea id={name} name={name} required={required} {...props} />
      ) : (
        <Input id={name} name={name} type={type} required={required} {...props} />
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Select id={name} name={name} required={required}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
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
