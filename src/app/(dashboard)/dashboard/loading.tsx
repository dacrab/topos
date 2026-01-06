import { ListItemSkeleton, PageHeaderSkeleton, Skeleton, StatCardSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="border border-border divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="border border-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border-b border-border last:border-b-0">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
