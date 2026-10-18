import Skeleton from "../../../components/ui/Skeleton";
import EmptyArt from "../../../components/ui/EmptyArt";

/** Loading skeleton for the staff accounts list. */
const StaffLoading = () => (
  <div
    role="status"
    aria-label="Loading staff accounts"
    className="rounded-clay bg-surface p-5 shadow-clay"
  >
    <Skeleton className="h-3 w-28" />
    <Skeleton className="mt-4 h-9 w-full rounded-clay-sm" />
    {[0, 1, 2].map((n) => (
      <Skeleton key={n} className="mt-2 h-11 w-full rounded-clay-sm" />
    ))}
  </div>
);

/** Empty state — no staff accounts match. */
const StaffEmpty = () => (
  <div className="rounded-clay bg-surface p-8 text-center shadow-clay">
    <EmptyArt variant="people" className="mx-auto h-18 w-32" />
    <p className="mt-3 text-[15px] font-bold text-ink-soft">No staff accounts found</p>
    <p className="mt-1 text-[12px] text-muted">
      Create an account so staff can sign in and run a facility.
    </p>
  </div>
);

export { StaffLoading, StaffEmpty };
