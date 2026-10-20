import Skeleton from "../../components/ui/Skeleton";
import StatusPanel from "../../components/ui/StatusPanel";
import { BAND_COLS } from "./occupancyUtils";

/**
 * Loading skeleton for the staff Occupancy dashboard — mirrors the real
 * layout: summary tiles, capacity meter, then the check-in form beside the
 * household list (stacked on small screens).
 */
const OccupancyLoading = () => (
  <div role="status" aria-label="Loading occupancy" className="space-y-4">
    {/* Hero band: occupancy hero + 2×2 metric wall */}
    <Skeleton className="h-3 w-44" />
    <div className={`grid items-stretch gap-4 ${BAND_COLS}`}>
      <div className="rounded-lg border border-line bg-surface p-5">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-3.5 h-10 w-52" />
        <Skeleton className="mt-3 h-24 w-full rounded-md" />
        <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-28 rounded-lg" />
        ))}
      </div>
    </div>

    {/* Operational band: household list | form + movement */}
    <div className="border-t border-line pt-4">
      <Skeleton className="h-3 w-40" />
    </div>
    <div className={`grid items-start gap-4 ${BAND_COLS}`}>
      <div className="order-2 space-y-4 lg:order-1">
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-28" />
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} className="mt-3 h-14 w-full rounded-md" />
          ))}
        </div>
      </div>
      <div className="order-1 space-y-4 lg:order-2">
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-full" />
          <Skeleton className="mt-2 h-8 w-full" />
          <Skeleton className="mt-3 h-9 w-full rounded-md" />
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-28" />
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="mt-3 h-10 w-full rounded-md" />
          ))}
        </div>
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
