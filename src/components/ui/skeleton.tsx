import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted/60 motion-safe:animate-pulse", className)} />
);
