import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 rounded-lg active:scale-[0.97]";

const BUTTON_VARIANTS = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  submit: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  primaryOutline: "border border-primary/30 text-primary hover:bg-primary/5",
} as const;

const BUTTON_SIZES = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs rounded-md",
  lg: "h-11 px-8 rounded-xl",
  icon: "h-9 w-9",
  submit: "px-6 py-3 rounded-xl",
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
