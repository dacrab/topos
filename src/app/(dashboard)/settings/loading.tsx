import { FormSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="border-b border-border pb-4">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <FormSkeleton />
    </div>
  );
}
