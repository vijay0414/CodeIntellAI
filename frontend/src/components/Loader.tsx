export function SkeletonLine({ w = '100%' }: { w?: string }) {
  return <div className="skeleton h-4 rounded-md" style={{ width: w }} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-4 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <SkeletonLine w="90%" />
      <SkeletonLine w="70%" />
    </div>
  )
}

export function PanelSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-4 pt-1 animate-pulse">
      <div className="skeleton h-5 w-40 rounded-md" />
      {Array.from({ length: cards }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
