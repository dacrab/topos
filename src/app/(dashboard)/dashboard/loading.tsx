const S = ({ className }: { className?: string }) => (
  <div className={`bg-muted animate-pulse ${className ?? ""}`} />
);

export default function DashboardLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div className="space-y-2">
          <S className="h-10 w-48" />
          <S className="h-4 w-32" />
        </div>
        <S className="h-9 w-28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-r border-b border-border p-8 space-y-4">
            <S className="h-3 w-24" />
            <S className="h-10 w-16" />
          </div>
        ))}
      </div>

      <div>
        <S className="h-4 w-32 mb-4" />
        <div className="border border-border divide-y divide-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <S className="h-10 w-10" />
              <div className="space-y-2 flex-1">
                <S className="h-3 w-48" />
                <S className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
