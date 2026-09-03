import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const CONTROL_BASE = "w-full border border-input bg-card py-2 px-3 text-sm rounded-lg";
const CONTROL_INTERACTIVE =
  "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/15 disabled:cursor-not-allowed";
const CONTROL_TEXT = "text-foreground placeholder:text-muted-foreground/50";

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        CONTROL_BASE,
        CONTROL_INTERACTIVE,
        CONTROL_TEXT,
        "disabled:bg-muted disabled:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        CONTROL_BASE,
        CONTROL_INTERACTIVE,
        CONTROL_TEXT,
        "resize-none disabled:bg-muted disabled:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        CONTROL_BASE,
        CONTROL_INTERACTIVE,
        CONTROL_TEXT,
        "disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
