import { Skeleton as S } from "@/components/ui/skeleton";

export default function ListingsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b-2 border-foreground/85 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <S className="h-3 w-32" />
          <S className="h-9 w-56" />
          <S className="h-4 w-72" />
        </div>
        <S className="h-9 w-32" />
      </div>
      <div className="flex gap-2 border-y border-border py-2">
        <S className="h-9 w-44" />
        <S className="h-9 w-28" />
        <S className="h-9 w-28" />
      </div>
      <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-3">
            <S className="aspect-[4/3] w-full" />
            <S className="h-3 w-24" />
            <S className="h-5 w-40" />
            <S className="h-3 w-full" />
            <div className="flex justify-between border-t border-border pt-3">
              <S className="h-5 w-24" />
              <S className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
