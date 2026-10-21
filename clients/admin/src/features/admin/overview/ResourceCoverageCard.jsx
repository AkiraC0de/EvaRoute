import { SkeletonCoverageRow } from "../../../components/ui/Skeleton";
import SectionCard from "./SectionCard";

/**
 * Readiness — mandatory essentials (electricity generator, drinkable water,
 * comfort room) available across facilities: "N of M" with a coverage meter.
 * This is the evacuation-domain question a generic dashboard can't ask, so
 * it earns its band. Meter color is status only (full = success, gaps in the
 * secondary accent) and every state is also spelled out in text.
 */
const ResourceCoverageCard = ({ summary }) => {
  if (!summary) {
    return (
      <SectionCard title="Readiness" meta="Mandatory essentials per facility.">
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((n) => (
            <SkeletonCoverageRow key={n} />
          ))}
        </div>
      </SectionCard>
    );
  }
  const rows = ["electricity", "water", "comfortRoom"]
    .map((key) => summary.resources?.[key])
    .filter(Boolean);

  return (
    <SectionCard
      title="Readiness"
      meta="Mandatory essentials per facility."
    >
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const missing = row.total - row.have;
          const pct = row.total > 0 ? (row.have / row.total) * 100 : 0;
          return (
            <div key={row.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-[11px] font-semibold text-ink-soft">{row.label}</p>
                <p className="text-[10.5px] text-muted">
                  <span className="font-semibold text-ink-soft">{row.have}</span> of{" "}
                  {row.total} facilities
                  {missing > 0 ? (
                    <span className="ml-1.5 font-semibold text-secondary-ink">
                      · {missing} missing
                    </span>
                  ) : (
                    <span className="ml-1.5 font-semibold text-success">· full coverage</span>
                  )}
                </p>
              </div>
              <div
                role="img"
                aria-label={`${row.label}: ${row.have} of ${row.total} facilities`}
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${missing > 0 ? "bg-secondary" : "bg-success"}`}
                  style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default ResourceCoverageCard;
