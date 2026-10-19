import { Home, Baby, Users, Building2 } from "lucide-react";

/**
 * Occupancy breakdown — the 2×2 metric wall beside the occupancy hero
 * (21st "Stats Card" anatomy: icon chip, oversized value, label + caption,
 * strict left alignment). Households / children / adults split the people
 * count; capacity states the ceiling the hero measures against.
 */

const OccupancySummary = ({ occupancy }) => {
  const tiles = [
    {
      label: "Households",
      value: occupancy.families,
      Icon: Home,
      caption: "checked in now",
    },
    {
      label: "Children",
      value: occupancy.children,
      Icon: Baby,
      caption: "under care",
    },
    {
      label: "Adults",
      value: occupancy.adults,
      Icon: Users,
      caption: "in the facility",
    },
    {
      label: "Capacity",
      value: occupancy.maxCapacity,
      Icon: Building2,
      caption: "total places",
    },
  ];

  return (
    <section aria-label="Occupancy breakdown" className="grid grid-cols-2 gap-3">
      {tiles.map(({ label, value, Icon, caption }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-clay bg-surface p-3.5 shadow-clay-xs"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-clay-sm bg-accent-soft text-accent"
          >
            <Icon size={15} strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p className="text-[22px] font-bold leading-none text-ink">{value}</p>
            <p className="mt-1.5 text-[11px] font-semibold text-ink-soft">{label}</p>
            <p className="mt-0.5 text-[10px] text-muted">{caption}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default OccupancySummary;
