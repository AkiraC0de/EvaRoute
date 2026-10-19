import Skeleton from "../../../components/ui/Skeleton";
import EmptyArt from "../../../components/ui/EmptyArt";

/** Loading skeleton — mirrors the ID-card grid (one card per account). */
const StaffLoading = () => (
  <div
    role="status"
    aria-label="Loading staff accounts"
    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
  >
    {[0, 1, 2, 3, 4, 5].map((n) => (
      <div key={n} className="overflow-hidden rounded-clay bg-surface shadow-clay">
        <Skeleton className="h-8 rounded-none" />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-clay-sm" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-2.5 w-32" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
        <div className="border-t border-line px-4 py-2.5">
          <Skeleton className="h-9 w-48 rounded-clay-sm" />
        </div>
      </div>
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
