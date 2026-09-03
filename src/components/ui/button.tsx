import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 rounded-lg active-scale";

const BUTTON_VARIANTS = {
  default:
    "bg-primary text-primary-foreground shadow-card hover:bg-primary/90 hover:shadow-card-hover",
  destructive:
    "bg-destructive text-destructive-foreground shadow-card hover:bg-destructive/90 hover:shadow-card-hover",
  outline: "border border-input bg-card hover:bg-secondary/60 hover:text-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
  ghost: "hover:bg-secondary/70 hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const;

const BUTTON_SIZES = {
  sm: "h-8 px-3.5 text-xs",
  default: "h-10 px-5",
  lg: "h-11 px-6",
  icon: "h-9 w-9",
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
