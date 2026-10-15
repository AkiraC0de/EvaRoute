/**
 * Occupancy headline: current occupants over capacity with a progress bar.
 */
const OccupancyMeter = ({ occupancy, capacity }) => {
  const percentage = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;

  return (
    <section
      aria-label="Facility occupancy"
      className="mb-4 rounded-clay bg-surface p-3 shadow-clay sm:p-4"
    >
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-[20px] font-bold text-ink-soft">{occupancy}</span>
        <span className="text-[11px] font-semibold text-muted">/ {capacity}</span>
        <span className="ml-auto rounded-full bg-warning-soft px-2.5 py-1 text-[8px] font-bold text-warning shadow-clay-inset">
          ● {percentage}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Facility capacity"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={occupancy}
        className="h-2 overflow-hidden rounded-full bg-[#edf0f6] shadow-clay-inset"
      >
        <div
          className="h-full rounded-full bg-[#f0b642] transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[8px] text-muted">
        <span>0</span>
        <span>{capacity} cap</span>
      </div>
    </section>
  );
};

export default OccupancyMeter;
