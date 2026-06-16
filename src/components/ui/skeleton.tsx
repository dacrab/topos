import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted/60 rounded-lg motion-safe:animate-pulse", className)} />
);
