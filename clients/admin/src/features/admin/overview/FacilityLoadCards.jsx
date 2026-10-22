import { Link } from "react-router-dom";
import EmptyArt from "../../../components/ui/EmptyArt";
import { SkeletonLoadCard } from "../../../components/ui/Skeleton";
import StatusPill from "../../../components/ui/StatusPill";
import SectionCard from "./SectionCard";
import { FOCUS_RING } from "./overviewStyles";
import { displayPlaceName } from "../../../lib/utils";

/**
 * Facility load cards — the busiest facilities as a card grid (one card per
 * facility, deepest load first): identity row (name left, availability pill
 * right), the occupancy as the headline number, a thin load meter
 * paired with the % in text, and the families count. Each card deep-links to
 * the facility's detail page. The meter is always paired with numbers —
 * never color alone. Cards are content-height; the grid keeps explicit
 * responsive columns so a lone card keeps its width.
 */
const FacilityLoadCards = ({ summary, loading }) => (
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
    {loading && !summary && (
      <div
        role="status"
        aria-label="Loading facility load"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {[0, 1, 2, 3].map((n) => (
          <SkeletonLoadCard key={n} />
        ))}
      </div>
    )}

    {summary && summary.facilityLoad.length > 0 && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary.facilityLoad.slice(0, 6).map((facility) => {
          const name = displayPlaceName(facility.name);
          const pct = Math.min(Math.round(facility.pct), 100);
          return (
            <Link
              key={facility.id}
              to={`/facilities/${facility.id}`}
              aria-label={`${name} — ${pct}% full, ${facility.occupied} of ${facility.maxCapacity} places`}
              className={`group flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-line-strong ${FOCUS_RING}`}
            >
              {/* Identity — name left, availability right */}
              <div className="flex items-center gap-2.5">
                <p
                  className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-soft transition-colors group-hover:text-ink"
                  title={name}
                >
                  {name}
                </p>
                <StatusPill status={facility.status} />
              </div>

              {/* Occupancy headline — the card's one big number */}
              <div className="flex items-baseline gap-1.5">
                <p className="text-[20px] font-bold leading-none text-ink">
                  {facility.occupied}
                  <span className="text-[12px] font-semibold text-muted">
                    {" "}
                    / {facility.maxCapacity}
                  </span>
                </p>
                <p className="text-[11px] text-muted">places</p>
              </div>

              {/* Load meter — % stated in text alongside, never color alone */}
              <div className="flex items-center gap-2">
                <div
                  role="img"
                  aria-label={`${pct} percent full`}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
                >
                  <div
                    className="h-full min-w-[6px] rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-ink-soft">
                  {pct}%
                </span>
              </div>

              <p className="text-[11px] text-muted">
                <span className="font-semibold text-ink-soft">{facility.families}</span>{" "}
                {facility.families === 1 ? "family" : "families"}
              </p>
            </Link>
          );
        })}
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

export default FacilityLoadCards;
