import Skeleton, { SkeletonActivityRow } from "../../components/ui/Skeleton";

/**
 * Loading skeleton for the staff facility home — mirrors the real bands:
 * hero + 2×2 fact wall, resources grid, then location/activity/roster.
 */
const FacilityLoading = () => (
  <div role="status" aria-label="Loading your facility" className="space-y-4">
    {/* Overview band */}
    <Skeleton className="h-3 w-40" />
    <div className="grid items-stretch gap-4 lg:grid-cols-[1.45fr_1fr]">
      <div className="rounded-lg border border-line bg-surface p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3.5 h-7 w-56" />
        <Skeleton className="mt-2.5 h-3 w-40" />
        <Skeleton className="mt-4 h-8 w-48 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="rounded-lg border border-line bg-surface p-3.5">
            <Skeleton className="h-2 w-16 rounded-full" />
            <Skeleton className="mt-2 h-6 w-12 rounded-full" />
            <Skeleton className="mt-2 h-2 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Resources band */}
    <Skeleton className="h-3 w-48 rounded-full" />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-2.5 w-16 rounded-full" />
          <Skeleton className="mt-3 h-8 w-full rounded-md" />
        </div>
      ))}
    </div>

    {/* Location & activity band */}
    <Skeleton className="h-3 w-40 rounded-full" />
    <div className="grid items-start gap-4 lg:grid-cols-[1.45fr_1fr]">
      <Skeleton className="h-72 rounded-lg" />
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          {[0, 1].map((n) => (
            <SkeletonActivityRow key={n} />
          ))}
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
          <Skeleton className="mt-2 h-2.5 w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export { FacilityLoading };
