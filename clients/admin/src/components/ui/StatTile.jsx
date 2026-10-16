/**
 * Small stat tile for breakdown grids (occupancy breakdown, admin overview).
 * Optional `icon` renders in a soft clay chip beside the value.
 */
const StatTile = ({ label, value, icon, className = "" }) => (
  <div className={`rounded-clay-sm bg-surface px-3 py-2.5 shadow-clay-xs ${className}`}>
    <div className="flex items-center gap-2">
      {icon && (
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[15px] font-bold leading-5 text-ink-soft">{value}</p>
        <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.5px] text-muted">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export default StatTile;
