export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-muted animate-pulse ${className ?? ""}`} />
);
