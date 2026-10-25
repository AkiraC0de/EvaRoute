import Skeleton, { SkeletonActivityRow } from "../../components/ui/Skeleton";
import StatusPanel from "../../components/ui/StatusPanel";
import { BAND_COLS } from "./occupancyUtils";

/**
 * Loading skeletons for the staff Occupancy dashboard — every block mirrors
 * its REAL component's anatomy exactly (meter hero, the hand-styled summary
 * tiles, the list toolbar + household rows, the quick-check-in form) so the
 * loading state and the loaded state are the same shape: no pop-in, no
 * layout jump.
 */

/** One OccupancySummary tile: round icon chip + label/number, sparkline + delta. */
const SkeletonSummaryTile = () => (
  <div className="flex gap-3 justify-between rounded-lg border border-line bg-surface p-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div>
        <Skeleton className="h-2.5 w-16 rounded-full" />
        <Skeleton className="mt-1.5 h-7 w-14 rounded-md" />
      </div>
    </div>
    <div className="flex flex-col gap-2 justify-end">
      <Skeleton className="h-[30px] w-[76px] rounded-md" />
      <Skeleton className="h-2.5 w-20 rounded-full" />
    </div>
  </div>
);

/** One household row: name + Check-In ID chip, meta line, chevron. */
const SkeletonHouseholdRow = () => (
  <div className="flex items-center gap-3 py-3">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-3.5 w-32 rounded-full" />
        <Skeleton className="h-5 w-11 rounded-full" />
      </div>
      <Skeleton className="mt-1.5 h-2.5 w-44 rounded-full" />
    </div>
    <Skeleton className="h-8 w-8 rounded-md" />
  </div>
);

const OccupancyLoading = ({ showPicker = false }) => (
  <div role="status" aria-label="Loading occupancy" className="space-y-4">
    {/* Page header (+ admin facility picker) */}
    <div>
      <Skeleton className="h-6 w-40 rounded-md" />
      <Skeleton className="mt-2 h-3 w-72 rounded-full" />
      {showPicker && <Skeleton className="mt-3 h-10 w-64 rounded-md" />}
    </div>

    {/* Hero band: occupancy meter panel + the 2x2 summary tile wall */}
    <div className={`grid items-stretch gap-4 ${BAND_COLS}`}>
      <div className="overflow-hidden rounded-lg bg-surface-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-2.5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3.5 h-10 w-56 rounded-md" />
        <Skeleton className="mt-2.5 h-5 w-36 rounded-full" />
        <Skeleton className="mt-4 h-3 w-full rounded-full" />
        <Skeleton className="mt-2 h-2 w-full rounded-full" />
        <Skeleton className="mt-2 h-2 w-2/5 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        {[0, 1, 2, 3].map((n) => (
          <SkeletonSummaryTile key={n} />
        ))}
      </div>
    </div>

    {/* Section header */}
    <div className="border-t border-line pt-4">
      <Skeleton className="h-3 w-40 rounded-full" />
      <Skeleton className="mt-2 h-2.5 w-64 rounded-full" />
    </div>

    {/* Operations grid: household list | quick check-in form */}
    <div className={`grid items-start gap-4 ${BAND_COLS}`}>
      <div className="order-2 lg:order-1">
        <div className="rounded-lg border border-line bg-surface p-4">
          {/* Toolbar: segmented toggle + category filter + search */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-44 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 min-w-[160px] flex-1 rounded-md" />
          </div>
          {/* Household rows + pagination */}
          <div className="mt-2 divide-y divide-line">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonHouseholdRow key={i} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      </div>
      <div className="order-1 space-y-4 lg:order-2">
        <div className="rounded-lg border border-line bg-surface p-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <div className="mt-3 space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
          <Skeleton className="mt-3.5 h-11 w-full rounded-md" />
        </div>
        {/* Recent movement trail (right column, under the form) */}
        <div className="rounded-lg border border-line bg-surface p-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="min-w-0">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="mt-1.5 h-2 w-40 rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            {[0, 1, 2].map((n) => (
              <SkeletonActivityRow key={n} />
            ))}
          </div>
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
 * Stays could not load — the API's own message plus a retry. `title`
 * differentiates the facility-list failure from the stays failure.
 */
const OccupancyError = ({ error, onRetry, title = "Could not load occupancy" }) => (
  <StatusPanel tone="error" title={title} onRetry={onRetry}>
    {error.message}
  </StatusPanel>
);

export { OccupancyLoading, OccupancyEmpty, OccupancyError };
