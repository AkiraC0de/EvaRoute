import Skeleton from "../../components/ui/Skeleton";

/**
 * Loading skeleton for the staff facility home — mirrors the real layout:
 * assignment summary bar, facility map card, resource tiles, activity strip.
 */
const FacilityLoading = () => (
  <div role="status" aria-label="Loading your facility" className="space-y-4">
    <Skeleton className="h-12 w-full rounded-clay" />

    <div className="rounded-clay bg-surface p-4 shadow-clay">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-40 w-full" />
    </div>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((n) => (
        <Skeleton key={n} className="h-14 rounded-clay-sm" />
      ))}
    </div>

    <div className="rounded-clay bg-surface p-4 shadow-clay">
      <Skeleton className="h-3 w-32" />
      {[0, 1].map((n) => (
        <Skeleton key={n} className="mt-3 h-8 w-full rounded-clay-sm" />
      ))}
    </div>
  </div>
);

export { FacilityLoading };
