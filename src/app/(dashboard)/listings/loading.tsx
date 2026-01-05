import { CardSkeleton, PageHeaderSkeleton } from "@/components/ui";

export default function ListingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <PageHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
