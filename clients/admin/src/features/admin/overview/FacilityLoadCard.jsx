import { Link } from "react-router-dom";
import EmptyArt from "../../../components/ui/EmptyArt";
import Skeleton from "../../../components/ui/Skeleton";
import StatusPill from "../../../components/ui/StatusPill";
import SectionCard from "./SectionCard";
import { FOCUS_RING } from "./overviewStyles";
import { displayPlaceName } from "../../../lib/utils";

/** Status → tone/label lives in components/ui/statusMeta (the ONE taxonomy). */

/** One facility-load row: name, status, capacity meter. */
const LoadRow = ({ facility }) => (
  <div className="py-2.5 first:pt-0 last:pb-0">
    <div className="flex items-center justify-between gap-2">
      <p
        className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-soft"
        title={facility.name}
      >
        {displayPlaceName(facility.name)}
      </p>
      <StatusPill status={facility.status} />
      <p className="shrink-0 text-[11px] text-muted">
        <span className="font-semibold text-ink-soft">{facility.occupied}</span>
        /{facility.maxCapacity}
      </p>
    </div>
    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sunken shadow-clay-inset">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-500"
        style={{ width: `${Math.min(facility.pct, 100)}%` }}
      />
    </div>
  </div>
);

/** Facility load card — busiest-first occupancy list with loading/empty states. */
const FacilityLoadCard = ({ summary, loading }) => (
  <SectionCard
    title="Facility load"
    meta="Occupancy by facility, busiest first."
    action={
      <Link
        to="/facilities"
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-accent-strong ${FOCUS_RING}`}
      >
        Manage →
      </Link>
    }
  >
    {loading && !summary && (
      <div role="status" aria-label="Loading facility load">
        {[0, 1, 2].map((n) => (
          <div key={n} className="py-2.5 first:pt-0 last:pb-0">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    )}
    {summary && summary.facilityLoad.length > 0 ? (
      <div className="divide-y divide-line">
        {summary.facilityLoad.slice(0, 5).map((facility) => (
          <LoadRow key={facility.id} facility={facility} />
        ))}
      </div>
    ) : null}
    {summary && summary.facilityLoad.length === 0 && (
      <div className="py-6 text-center">
        <EmptyArt variant="map" className="mx-auto h-16 w-28" />
        <p className="mt-2 text-[12px] text-muted">
          No facilities yet — register one to start tracking load.
        </p>
      </div>
    )}
  </SectionCard>
);

export default FacilityLoadCard;
