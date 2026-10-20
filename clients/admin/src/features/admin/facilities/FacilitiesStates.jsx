import Skeleton from "../../../components/ui/Skeleton";
import EmptyArt from "../../../components/ui/EmptyArt";

/** Loading skeleton for the facilities list. */
const FacilitiesLoading = () => (
  <div
    role="status"
    aria-label="Loading facilities"
    className="rounded-lg border border-line bg-surface p-5"
  >
    <Skeleton className="h-3 w-32" />
    <Skeleton className="mt-4 h-9 w-full rounded-md" />
    {[0, 1, 2].map((n) => (
      <Skeleton key={n} className="mt-2 h-11 w-full rounded-md" />
    ))}
  </div>
);

/** Empty state — no facilities, or none in the deleted tab. */
const FacilitiesEmpty = ({ showDeleted }) => (
  <div className="rounded-lg border border-line bg-surface p-8 text-center">
    <EmptyArt variant={showDeleted ? "boxes" : "map"} className="mx-auto h-18 w-32" />
    <p className="mt-3 text-[15px] font-bold text-ink-soft">
      {showDeleted ? "No deleted facilities" : "No facilities found"}
    </p>
    <p className="mt-1 text-[12px] text-muted">
      {showDeleted
        ? "Soft-deleted facilities will appear here so you can restore them."
        : "Register a new evacuation center to get started."}
    </p>
  </div>
);

/** Loading skeleton for the facility detail page (tiles + form + staff). */
const FacilityDetailLoading = () => (
  <div role="status" aria-label="Loading facility" className="space-y-4">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[0, 1, 2, 3].map((n) => (
        <Skeleton key={n} className="h-14 rounded-md" />
      ))}
    </div>
    <div className="rounded-lg border border-line bg-surface p-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-8 w-full" />
      <Skeleton className="mt-2 h-8 w-full" />
      <Skeleton className="mt-2 h-8 w-1/2" />
    </div>
    <div className="rounded-lg border border-line bg-surface p-4">
      <Skeleton className="h-3 w-24" />
      {[0, 1].map((n) => (
        <Skeleton key={n} className="mt-3 h-9 w-full rounded-md" />
      ))}
    </div>
  </div>
);

/** Loading skeleton for the assigned-staff list (avatar + name + role rows). */
const FacilityStaffLoading = () => (
  <ul role="status" aria-label="Loading staff" className="mb-4 space-y-2">
    {[0, 1, 2].map((n) => (
      <li key={n} className="flex items-center gap-3 rounded-md border border-line bg-surface p-2.5">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-1.5 h-2 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </li>
    ))}
  </ul>
);

export { FacilitiesLoading, FacilitiesEmpty, FacilityDetailLoading, FacilityStaffLoading };
