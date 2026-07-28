/** Lightweight loading placeholder. Uses the surface token so it adapts to theme. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={"animate-pulse rounded-md bg-surface-2 " + className}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/5" />
        </div>
      </div>
    </div>
  );
}
