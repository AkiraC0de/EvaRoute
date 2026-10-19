import { Users, Boxes, Zap, Warehouse } from "lucide-react";

/**
 * The 2×2 metric wall beside the facility hero (occupancy metric-wall
 * anatomy: icon chip, oversized value, label + caption, strict left
 * alignment). Every number is derived from real data — no invented metrics.
 */
const FacilityTiles = ({
  maxCapacity,
  essentialsReady,
  essentialsTotal,
  resourceCount,
  staffCount,
}) => {
  const tiles = [
    {
      label: "Max capacity",
      value: maxCapacity,
      Icon: Warehouse,
      caption: "places",
    },
    {
      label: "Essentials",
      value: `${essentialsReady}/${essentialsTotal}`,
      Icon: Zap,
      caption: "mandatory",
    },
    {
      label: "Resources",
      value: resourceCount,
      Icon: Boxes,
      caption: "tracked",
    },
    {
      label: "Staff",
      value: staffCount,
      Icon: Users,
      caption: "assigned",
    },
  ];

  return (
    <section aria-label="Facility facts" className="grid grid-cols-2 gap-3">
      {tiles.map(({ label, value, Icon, caption }) => (
        <div
          key={label}
          className="flex h-full flex-col gap-2 rounded-clay bg-surface p-3.5 shadow-clay-xs"
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center gap-20 justify-center rounded-clay-sm bg-accent-soft text-accent"
            >
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <p className="w-50 text-[11px] font-bold text-ink-soft">{label}</p>
          </div>
          <div className="mt-auto min-w-0">
            <p className="text-[22px] font-bold leading-none text-ink">{value}</p>
            <p className="mt-0.5 text-[10px] text-muted">{caption}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FacilityTiles;
