import Skeleton from "../../components/ui/Skeleton";
import EmptyArt from "../../components/ui/EmptyArt";

/** Loading skeleton for the facilities list. */
const FacilitiesLoading = () => (
  <div
    role="status"
    aria-label="Loading facilities"
    className="rounded-clay bg-surface p-5 shadow-clay"
  >
    <Skeleton className="h-3 w-32" />
    <Skeleton className="mt-4 h-9 w-full rounded-clay-sm" />
    {[0, 1, 2].map((n) => (
      <Skeleton key={n} className="mt-2 h-11 w-full rounded-clay-sm" />
    ))}
  </div>
);

/** Empty state — no facilities, or none in the deleted tab. */
const FacilitiesEmpty = ({ showDeleted }) => (
  <div className="rounded-clay bg-surface p-8 text-center shadow-clay">
    <EmptyArt variant={showDeleted ? "boxes" : "map"} className="mx-auto h-18 w-32" />
    <p className="mt-3 text-[13px] font-bold text-ink-soft">
      {showDeleted ? "No deleted facilities" : "No facilities found"}
    </p>
    <p className="mt-1 text-[10px] text-muted">
      {showDeleted
        ? "Soft-deleted facilities will appear here so you can restore them."
        : "Register a new evacuation center to get started."}
    </p>
  </div>
);

export { FacilitiesLoading, FacilitiesEmpty };
