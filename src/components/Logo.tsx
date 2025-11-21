import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground overflow-hidden shadow-sm">
        {/* Sharp Geometric 'A' Monogram */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          <title>Aether Logo</title>
          {/* Left diagonal */}
          <path
            d="M3 21L12 4L14.5 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          {/* Right diagonal/cross */}
          <path
            d="M21 21L12 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className="opacity-50"
          />
          {/* Horizontal bar - abstract */}
          <path
            d="M7.5 13H16.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tighter text-foreground">
          AETHER
        </span>
      )}
    </div>
  );
}
