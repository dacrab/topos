import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-muted rounded animate-pulse", className)} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-end justify-between border-b border-border pb-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-8 border-r border-b border-border">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-12 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="p-4 flex gap-3">
      <Skeleton className="w-8 h-8" />
      <div className="flex-1">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  const items = Array.from({ length: fields }, (_, i) => `skeleton-field-${i}`);
  return (
    <div className="space-y-6 max-w-xl">
      {items.map((id) => (
        <div key={id} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
