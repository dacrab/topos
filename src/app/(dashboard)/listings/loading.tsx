import { Skeleton as S } from "@/components/ui/skeleton";

export default function ListingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <S className="h-8 w-48" />
          <S className="h-4 w-72" />
        </div>
        <S className="h-9 w-32" />
      </div>
      <div className="flex gap-3">
        <S className="h-9 w-44" />
        <S className="h-9 w-28" />
        <S className="h-9 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-base p-5 space-y-4">
            <div className="flex justify-between">
              <S className="h-5 w-40" />
              <S className="h-5 w-16" />
            </div>
            <S className="h-3 w-full" />
            <S className="h-3 w-3/4" />
            <div className="flex justify-between pt-3 border-t border-border">
              <S className="h-6 w-24" />
              <S className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
