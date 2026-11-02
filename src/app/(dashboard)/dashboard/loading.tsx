import { Skeleton as S } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <div className="space-y-3 border-b-2 border-foreground/85 pb-6">
        <S className="h-3 w-28" />
        <S className="h-9 w-56" />
        <S className="h-4 w-72" />
      </div>

      <div className="grid border-y border-border md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="space-y-4 border-b border-border px-5 py-5 md:border-b-0 md:border-l md:first:border-l-0"
          >
            <S className="h-3 w-24" />
            <S className="h-9 w-20" />
          </div>
        ))}
      </div>

      <div>
        <S className="mb-4 h-5 w-36" />
        <div className="border-t border-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border py-4">
              <S className="h-3 w-5" />
              <S className="h-8 w-8" />
              <div className="flex-1 space-y-2">
                <S className="h-3.5 w-48" />
                <S className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
