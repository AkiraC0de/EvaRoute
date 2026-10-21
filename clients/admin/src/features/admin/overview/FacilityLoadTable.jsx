import { Link } from "react-router-dom";
import EmptyArt from "../../../components/ui/EmptyArt";
import { SkeletonLoadRow } from "../../../components/ui/Skeleton";
import StatusPill from "../../../components/ui/StatusPill";
import SectionCard from "./SectionCard";
import { FOCUS_RING } from "./overviewStyles";
import { displayPlaceName } from "../../../lib/utils";

/**
 * Facility load table — the dense operational table (busiest first): name,
 * status, an inline occupancy meter, and the numbers (occupied/capacity,
 * families, fill %). A table because here the data IS the interface; rows
 * wrap to stacked blocks below md so mobile stays readable. Meters are
 * paired with the numbers in text — never color alone.
 */
const FacilityLoadTable = ({ summary, loading }) => (
  <SectionCard
    title="Facility load"
    meta="Busiest first."
    action={
      <Link
        to="/facilities"
        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary-ink transition hover:text-primary-strong ${FOCUS_RING}`}
      >
        Manage →
      </Link>
    }
  >
    {/* Column headers — desktop only (rows stack on mobile). */}
    <div className="hidden grid-cols-[minmax(0,1fr)_92px_minmax(110px,160px)_190px_52px] items-center gap-3 border-b border-line pb-1.5 text-[9px] font-semibold uppercase tracking-[0.8px] text-muted-dim md:grid">
      <span>Facility</span>
      <span>Status</span>
      <span>Load</span>
      <span className="text-right">Occupancy</span>
      <span className="text-right">Full</span>
    </div>

    {loading && !summary && (
      <div role="status" aria-label="Loading facility load" className="mt-1">
        {[0, 1, 2].map((n) => (
          <SkeletonLoadRow key={n} />
        ))}
      </div>
    )}

    {summary && summary.facilityLoad.length > 0 && (
      <div className="divide-y divide-line">
        {summary.facilityLoad.slice(0, 6).map((facility) => (
          <div
            key={facility.id}
            className="grid grid-cols-1 gap-1.5 py-2.5 md:grid-cols-[minmax(0,1fr)_92px_minmax(110px,160px)_190px_52px] md:items-center md:gap-3"
          >
            <p
              className="min-w-0 truncate text-[12px] font-semibold text-ink-soft"
              title={displayPlaceName(facility.name)}
            >
              {displayPlaceName(facility.name)}
            </p>
            <div>
              <StatusPill status={facility.status} />
            </div>
            <div
              role="img"
              aria-label={`${Math.round(facility.pct)} percent full`}
              className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className="h-full min-w-[6px] rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${Math.min(facility.pct, 100)}%` }}
              />
            </div>
            <p className="whitespace-nowrap text-[11px] text-muted md:text-right">
              <span className="font-semibold text-ink-soft">{facility.occupied}</span>
              /{facility.maxCapacity} places ·{" "}
              <span className="font-semibold text-ink-soft">{facility.families}</span> families
            </p>
            <p className="text-[11px] font-semibold text-ink-soft md:text-right">
              {Math.round(facility.pct)}%
            </p>
          </div>
        ))}
      </div>
    )}

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

export default FacilityLoadTable;
