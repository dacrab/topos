import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const BUTTON_BASE =
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-md";

const BUTTON_VARIANTS = {
  default: "bg-foreground text-background shadow-sm hover:bg-foreground/90",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  outline:
    "border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  primary:
    "bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm",
  primaryOutline:
    "border border-border text-sm font-medium hover:bg-accent transition-colors shadow-sm",
  submit:
    "bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm",
} as const;

const BUTTON_SIZES = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-8",
  icon: "h-9 w-9",
  submit: "px-6 py-3",
  auto: "",
} as const;

type ButtonVariant = keyof typeof BUTTON_VARIANTS;
type ButtonSize = keyof typeof BUTTON_SIZES;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...props}
    />
  );
}
