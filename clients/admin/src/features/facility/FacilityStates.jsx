import Skeleton, { SkeletonActivityRow } from "../../components/ui/Skeleton";

/**
 * Loading skeleton for the staff facility home — mirrors the real deck
 * anatomy: command hero (identity + status console), readiness rail (one
 * divided instrument strip), resources workspace (header + filters + grid),
 * then the activity/place split.
 */
const FacilityLoading = () => (
  <div role="status" aria-label="Loading your facility" className="space-y-4">
    {/* Command hero: identity beside the status console */}
    <div className="grid gap-5 rounded-lg bg-primary-strong p-5 lg:grid-cols-[1.6fr_1fr] lg:p-6">
      <div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-2.5 w-44 rounded-full bg-white/25" />
        </div>
        <Skeleton className="mt-3.5 h-7 w-2/3 rounded-md bg-white/25" />
        <Skeleton className="mt-2.5 h-2.5 w-1/2 rounded-full bg-white/20" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-28 rounded-full bg-white/20" />
          <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="flex flex-col gap-3.5 rounded-md border border-white/20 bg-white/10 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-20 rounded-full bg-white/25" />
          <Skeleton className="h-5 w-20 rounded-full bg-white/30" />
        </div>
        <div>
          <Skeleton className="h-2.5 w-24 rounded-full bg-white/25" />
          <Skeleton className="mt-2 h-1.5 w-full rounded-full bg-white/25" />
          <Skeleton className="mt-2 h-2 w-40 rounded-full bg-white/20" />
        </div>
        <div>
          <Skeleton className="h-2.5 w-28 rounded-full bg-white/25" />
          <div className="mt-2 flex gap-1">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} className="h-1.5 flex-1 rounded-full bg-white/25" />
            ))}
          </div>
        </div>
        <Skeleton className="mt-auto h-10 w-full rounded-md bg-white/30" />
      </div>
    </div>

    {/* Readiness rail — one divided instrument strip */}
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {[0, 1, 2, 3, 4].map((n) => (
        <div key={n} className="flex items-start gap-2.5 bg-surface p-3.5 last:col-span-2 sm:last:col-span-2 lg:last:col-span-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div>
            <Skeleton className="h-2 w-14 rounded-full" />
            <Skeleton className="mt-2 h-5 w-10 rounded-full" />
            <Skeleton className="mt-1.5 h-2 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    {/* Resources workspace */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <Skeleton className="h-3 w-44 rounded-full" />
        <Skeleton className="mt-2 h-2.5 w-56 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-10 w-full rounded-md sm:max-w-[260px]" />
      <Skeleton className="h-10 w-56 rounded-full" />
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="rounded-lg border border-line bg-surface p-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-2.5 w-16 rounded-full" />
          <Skeleton className="mt-3 h-8 w-full rounded-md" />
        </div>
      ))}
    </div>

    {/* Activity & place split */}
    <div className="grid items-start gap-4 lg:grid-cols-[1.45fr_1fr]">
      <div className="rounded-lg border border-line bg-surface p-4">
        <Skeleton className="h-3 w-28 rounded-full" />
        {[0, 1, 2, 3].map((n) => (
          <SkeletonActivityRow key={n} />
        ))}
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-[220px] w-full rounded-md" />
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 1, 2].map((n) => (
              <Skeleton key={n} className="h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { FacilityLoading };
