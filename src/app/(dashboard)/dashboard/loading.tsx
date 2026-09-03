import { Skeleton as S } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <S className="h-8 w-48" />
        <S className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-base p-6 space-y-4">
            <S className="h-3 w-24" />
            <S className="h-9 w-20" />
          </div>
        ))}
      </div>

      <div>
        <S className="h-4 w-32 mb-4" />
        <div className="card-base divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <S className="h-9 w-9 rounded-lg" />
              <div className="space-y-2 flex-1">
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
