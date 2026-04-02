const S = ({ className }: { className?: string }) => (
  <div className={`bg-muted animate-pulse ${className ?? ""}`} />
);

export default function ListingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <S className="h-8 w-48" />
        <S className="h-9 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border border-border p-6 space-y-4">
            <div className="flex justify-between">
              <S className="h-5 w-40" />
              <S className="h-5 w-16" />
            </div>
            <S className="h-3 w-full" />
            <S className="h-3 w-3/4" />
            <div className="flex justify-between pt-2 border-t border-border">
              <S className="h-6 w-24" />
              <S className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
