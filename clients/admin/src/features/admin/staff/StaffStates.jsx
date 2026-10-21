import { SkeletonIdCard } from "../../../components/ui/Skeleton";
import EmptyArt from "../../../components/ui/EmptyArt";

/** Loading skeleton — mirrors the ID-card grid (one card per account). */
const StaffLoading = () => (
  <div
    role="status"
    aria-label="Loading staff accounts"
    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
  >
    {[0, 1, 2, 3, 4, 5].map((n) => (
      <SkeletonIdCard key={n} />
    ))}
  </div>
);

/** Empty state — no staff accounts match. */
const StaffEmpty = () => (
  <div className="rounded-lg border border-line bg-surface p-8 text-center">
    <EmptyArt variant="people" className="mx-auto h-18 w-32" />
    <p className="mt-3 text-[15px] font-bold text-ink-soft">No staff accounts found</p>
    <p className="mt-1 text-[12px] text-muted">
      Create an account so staff can sign in and run a facility.
    </p>
  </div>
);

export { StaffLoading, StaffEmpty };
