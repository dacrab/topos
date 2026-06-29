import { cn } from "@/lib/utils";

type ArchTopBarProps = {
  color?: "primary" | "accent";
  opacity?: "5" | "10" | "solid";
  className?: string;
};

export function ArchTopBar({ color = "primary", opacity = "10", className }: ArchTopBarProps) {
  return (
    <div
      className={cn(
        "arch-top shrink-0",
        color === "primary" && opacity === "5" && "h-1.5 bg-primary/5",
        color === "primary" && opacity === "10" && "h-1.5 bg-primary/10",
        color === "primary" && opacity === "solid" && "h-1.5 bg-primary",
        color === "accent" && opacity === "10" && "h-1.5 bg-accent/10",
        className,
      )}
    />
  );
}
