import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted rounded-md motion-safe:animate-pulse", className)} />
);
