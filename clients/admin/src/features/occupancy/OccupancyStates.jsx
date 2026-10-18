import Skeleton from "../../components/ui/Skeleton";
import StatusPanel from "../../components/ui/StatusPanel";

/**
 * Loading skeleton for the staff Occupancy dashboard — mirrors the real
 * layout: summary tiles, capacity meter, then the check-in form beside the
 * household list (stacked on small screens).
 */
const OccupancyLoading = () => (
  <div role="status" aria-label="Loading occupancy" className="space-y-4">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {[0, 1, 2, 3].map((n) => (
        <Skeleton key={n} className="h-14 rounded-clay-sm" />
      ))}
      <Skeleton className="col-span-2 h-14 rounded-clay-sm sm:col-span-1" />
    </div>

    <div className="rounded-clay bg-surface p-4 shadow-clay">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
      <Skeleton className="mt-1.5 h-2 w-24" />
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)]">
      <div className="rounded-clay bg-surface p-4 shadow-clay">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-full" />
        <Skeleton className="mt-2 h-8 w-full" />
        <Skeleton className="mt-3 h-9 w-full rounded-clay-sm" />
      </div>
      <div className="rounded-clay bg-surface p-4 shadow-clay">
        <Skeleton className="h-3 w-28" />
        {[0, 1, 2, 3].map((n) => (
          <Skeleton key={n} className="mt-3 h-10 w-full rounded-clay-sm" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * No facility to operate on — admin vs staff guidance.
 */
const OccupancyEmpty = ({ isAdmin }) => (
  <StatusPanel tone="empty" title="No facility available">
    {isAdmin
      ? "Register a facility first — occupancy works per facility."
      : "Your account is not assigned to a facility yet. Ask an administrator to assign you."}
  </StatusPanel>
);

/**
 * Stays could not load — the API's own message plus a retry.
 */
const OccupancyError = ({ error, onRetry }) => (
  <StatusPanel tone="error" title="Could not load occupancy" onRetry={onRetry}>
    {error.message}
  </StatusPanel>
);

export { OccupancyLoading, OccupancyEmpty, OccupancyError };
