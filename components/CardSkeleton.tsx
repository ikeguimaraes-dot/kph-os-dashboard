export function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-card p-5 ring-1 ring-white/5">
      <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-8 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-3 w-20 animate-pulse rounded bg-white/5" />
      <div className="mt-6 h-3 w-28 animate-pulse rounded bg-white/5" />
    </div>
  );
}

export function CardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
