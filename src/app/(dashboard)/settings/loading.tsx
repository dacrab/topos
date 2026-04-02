const S = ({ className }: { className?: string }) => (
  <div className={`bg-muted animate-pulse ${className ?? ""}`} />
);

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="border-b border-border pb-4 space-y-2">
        <S className="h-6 w-32" />
        <S className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <S className="h-3 w-24" />
            <S className="h-10 w-full" />
          </div>
        ))}
        <S className="h-10 w-32 mt-2" />
      </div>
    </div>
  );
}
