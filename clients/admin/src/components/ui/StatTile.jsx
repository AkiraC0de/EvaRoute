/**
 * Small stat tile for breakdown grids (occupancy breakdown, admin overview).
 * Optional `icon` renders in a flat tinted chip beside the value. `tone`
 * picks the CATEGORY tint — tints carry meaning, never decoration:
 * primary = occupancy/capacity, secondary = people, warm = places,
 * neutral = records.
 */
const CHIP_TONES = {
  primary: "bg-primary-soft text-primary-ink",
  secondary: "bg-secondary-soft text-secondary-ink",
  warm: "bg-warm-soft text-warm-ink",
  neutral: "bg-surface-2 text-muted",
};

const StatTile = ({ label, value, icon, tone = "neutral", className = "" }) => (
  <div className={`rounded-md border border-line bg-surface px-3 py-2.5 ${className}`}>
    <div className="flex items-center gap-2">
      {icon && (
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${CHIP_TONES[tone] ?? CHIP_TONES.neutral}`}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[17px] font-bold leading-5 text-ink">{value}</p>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.5px] text-muted">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export default StatTile;
