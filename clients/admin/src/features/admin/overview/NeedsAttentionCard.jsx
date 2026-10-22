import { AlertTriangle, ArrowRight, CheckCircle2 } from "../../../components/icons/evaIcons";
import { Link } from "react-router-dom";
import { SkeletonAttentionRow } from "../../../components/ui/Skeleton";
import { displayPlaceName } from "../../../lib/utils";
import SectionCard from "./SectionCard";

/**
 * Needs attention — the dashboard's threshold panel (the one thing an
 * operational dashboard owes its reader: "what needs me?"). NAMED facility
 * exceptions only, never counts — counts live in the hero chips and "At a
 * glance". Thresholds: >= 85% of capacity, or any mandatory essential not
 * available. Every row is a link into the facilities page so acting is
 * cheap; when nothing crosses a threshold the panel says so plainly.
 */
const NeedsAttentionCard = ({ summary }) => {
  // Loading keeps the card shell + row anatomy (no pop-in when data lands).
  if (!summary) {
    return (
      <SectionCard title="Needs attention" meta="85% full or a missing essential.">
        <ul className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((n) => (
            <li key={n}>
              <SkeletonAttentionRow />
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }
  const near = summary.attention?.nearCapacity ?? [];
  const missing = summary.attention?.missingResources ?? [];
  const quiet = near.length === 0 && missing.length === 0;

  return (
    <SectionCard
      title="Needs attention"
      meta="85% full or a missing essential."
      action={
        !quiet && (
          <Link
            to="/facilities"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary-ink hover:underline"
          >
            Open facilities
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        )
      }
    >
      {quiet ? (
        <div className="flex items-center gap-2.5 rounded-md border border-line bg-surface-2 px-3 py-2.5">
          <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-success" />
          <p className="text-[11px] text-muted">
            Every facility is within thresholds — nothing needs you right now.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {near.map((facility) => (
            <li key={`near-${facility.id}`}>
              <Link
                to={`/facilities/${facility.id}`}
                className="flex min-h-11 flex-col gap-0.5 rounded-md border border-line bg-surface-2 px-3 py-2 transition-colors hover:bg-surface-2-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-secondary-ink" />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-ink-soft" title={displayPlaceName(facility.name)}>
                    {displayPlaceName(facility.name)}
                  </span>
                  <ArrowRight size={13} aria-hidden="true" className="shrink-0 text-muted-dim" />
                </span>
                <span className="pl-[23px] text-[10.5px] font-semibold text-secondary-ink">
                  {Math.round(facility.pct)}% full · {facility.occupied}/{facility.maxCapacity} taken
                </span>
              </Link>
            </li>
          ))}
          {missing.map((facility) => (
            <li key={`missing-${facility.id}`}>
              <Link
                to={`/facilities/${facility.id}`}
                className="flex min-h-11 flex-col gap-0.5 rounded-md border border-line bg-surface-2 px-3 py-2 transition-colors hover:bg-surface-2-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-secondary-ink" />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-ink-soft" title={displayPlaceName(facility.name)}>
                    {displayPlaceName(facility.name)}
                  </span>
                  <ArrowRight size={13} aria-hidden="true" className="shrink-0 text-muted-dim" />
                </span>
                <span
                  className="pl-[23px] text-[10.5px] font-semibold text-secondary-ink text-pretty"
                  title={`Missing: ${facility.missing.join(", ")}`}
                >
                  Missing: {facility.missing.join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

export default NeedsAttentionCard;
