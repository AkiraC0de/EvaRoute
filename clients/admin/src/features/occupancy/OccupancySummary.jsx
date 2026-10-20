import { Home, Baby, Users, Building2 } from "lucide-react";

/**
 * Occupancy breakdown — the 2×2 metric wall beside the occupancy hero
 * (icon chip, oversized value, label + caption, strict left alignment).
 * Icon chips carry the category tint — people counts in the operations
 * teal, capacity in the structural navy — and one tile never mixes units
 * (people vs places). Households / children / adults split the people
 * count; capacity states the ceiling the hero measures against.
 */

const TILE_TONES = {
  people: "bg-secondary-soft text-secondary-ink",
  capacity: "bg-primary-soft text-primary",
};

const OccupancySummary = ({ occupancy }) => {
  const tiles = [
    {
      label: "Households",
      value: occupancy.families,
      Icon: Home,
      caption: "checked in now",
      tone: "people",
    },
    {
      label: "Children",
      value: occupancy.children,
      Icon: Baby,
      caption: "under care",
      tone: "people",
    },
    {
      label: "Adults",
      value: occupancy.adults,
      Icon: Users,
      caption: "in the facility",
      tone: "people",
    },
    {
      label: "Capacity",
      value: occupancy.maxCapacity,
      Icon: Building2,
      caption: "total places",
      tone: "capacity",
    },
  ];

  return (
    <section aria-label="Occupancy breakdown" className="grid grid-cols-2 gap-3">
      {tiles.map(({ label, value, Icon, caption, tone }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3.5"
        >
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 items-center justify-center rounded-md ${TILE_TONES[tone]}`}
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
