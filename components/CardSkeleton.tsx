function Block({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className ?? ""}`} />;
}

export function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-5 ring-1 ring-white/5">
      <Block className="h-3 w-24" />
      <Block className="mt-4 h-8 w-32" />
      <Block className="mt-3 h-3 w-20 opacity-50" />
      {tall && <Block className="mt-4 h-32 w-full opacity-40" />}
      <Block className="mt-auto h-3 w-28 pt-3 opacity-50" />
    </div>
  );
}

/** Skeleton seguindo o layout novo: hero + linha de gráficos + grids. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <CardSkeleton tall />
        <div className="grid grid-cols-1 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
      {/* Linha de gráficos */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.4fr_1fr]">
        <CardSkeleton tall />
        <CardSkeleton tall />
        <div className="grid grid-cols-1 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
