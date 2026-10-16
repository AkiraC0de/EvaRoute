import { capacityState, occupancyPct } from "./occupancyUtils";

/**
 * Occupancy headline: current people over capacity, a status-aware progress
 * bar and a plain-language state (Open / Nearly full / Full) — never color
 * alone. The bar uses the feedback tokens so it reads consistently with the
 * rest of the app.
 */

const BAR_TONE = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};
const CHIP_TONE = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

const OccupancyMeter = ({ occupancy, capacity }) => {
  const pct = occupancyPct(occupancy, capacity);
  const state = capacityState(occupancy, capacity);
  const remaining = Math.max(0, capacity - occupancy);

  return (
    <section
      aria-label="Facility occupancy"
      className="mb-4 rounded-clay bg-surface p-4 shadow-clay"
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="text-[22px] font-bold text-ink-soft">{occupancy}</span>
        <span className="text-[13px] font-semibold text-muted">/ {capacity} places taken</span>
        <span
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-clay-inset ${CHIP_TONE[state.tone]}`}
        >
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${BAR_TONE[state.tone]}`} />
          {state.label} · {pct}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Facility capacity"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={occupancy}
        className="h-2.5 overflow-hidden rounded-full bg-sunken shadow-clay-inset"
      >
        <div
          className={`h-full min-w-[6px] rounded-full transition-[width] duration-500 ${BAR_TONE[state.tone]}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-muted">
        <span>
          {remaining} seat{remaining === 1 ? "" : "s"} remaining
        </span>
        <span>{capacity} cap</span>
      </div>
    </section>
  );
};

export default OccupancyMeter;
