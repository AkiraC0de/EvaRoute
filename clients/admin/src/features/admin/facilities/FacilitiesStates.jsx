import Skeleton from "../../../components/ui/Skeleton";
import EmptyArt from "../../../components/ui/EmptyArt";

/** One map-surface block (matches the map card's inner height per view). */
const MapBlockSkeleton = ({ height }) => (
  <div className="rounded-lg border border-line bg-surface p-4">
    <div className="flex items-center gap-2.5">
      <Skeleton className="h-8 w-8 rounded-md" />
      <div className="flex-1">
        <Skeleton className="h-3 w-28 rounded-none" />
        <Skeleton className="mt-1.5 h-2 w-48 rounded-none" />
      </div>
    </div>
    <Skeleton className="mt-3 rounded-md" style={{ height }} />
  </div>
);

/** Table block — mirrors the registry table's columns and row rhythm. */
const TableBlockSkeleton = () => (
  <div className="rounded-lg border border-line bg-surface">
    <div className="flex items-center gap-3 rounded-t-lg bg-surface-2 px-4 py-2.5">
      <Skeleton className="h-3.5 w-3.5 rounded-xs" />
      {["w-16", "w-14", "w-12", "w-20", "w-10", "w-12"].map((width) => (
        <Skeleton key={width} className={`h-2 ${width} rounded-none`} />
      ))}
    </div>
    <div className="divide-y divide-line">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
        <div key={n} className="flex items-center gap-3 px-4 py-2.5">
          <Skeleton className="h-3.5 w-3.5 rounded-xs" />
          <Skeleton className="h-2.5 w-36 rounded-none" />
          <Skeleton className="h-2.5 w-28 rounded-none" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <div className="w-[110px]">
            <Skeleton className="h-2 w-full rounded-none" />
            <Skeleton className="mt-1 h-1.5 w-full rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-6 rounded-none" />
          <Skeleton className="ml-auto h-2.5 w-16 rounded-none" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Loading skeleton for the facilities registry — mirrors the SELECTED view
 * mode's composition (default Split: map beside the table; Map: the tall
 * map surface; List: the table), so the layout never jumps on data arrival.
 */
const FacilitiesLoading = ({ view = "split" }) => (
  <div role="status" aria-label="Loading facilities" className="space-y-4">
    {view === "map" && <MapBlockSkeleton height={560} />}
    {view === "list" && <TableBlockSkeleton />}
    {view === "split" && (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MapBlockSkeleton height={420} />
        <TableBlockSkeleton />
      </div>
    )}
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
        <div key={n} className="rounded-lg border border-line bg-surface p-3">
          <Skeleton className="h-2 w-12 rounded-full" />
          <Skeleton className="mt-2 h-5 w-12 rounded-full" />
        </div>
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
