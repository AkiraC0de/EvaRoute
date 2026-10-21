import RollingNumber from "../../components/ui/RollingNumber";
import Sparkline from "../../components/ui/Sparkline";
import { Home, Baby, Users, Building2 } from "lucide-react";
import { last24hNew, newPerDay } from "./occupancyUtils";

/**
 * Occupancy breakdown — the 2x2 metric wall beside the occupancy hero.
 *
 * Tile anatomy (growth-card design): tinted icon tile, then the oversized
 * value over its label + unit caption, a decorative growth sparkline
 * (new arrivals per day) to the right, and a bare-text delta chip at the
 * bottom right ("+N New · last 24h"). Icon chips carry the category tint —
 * people counts in the operations teal, capacity in the structural navy —
 * and one tile never mixes units (people vs places).
 *
 * Capacity has no growth concept (it is set by administrators), so its tile
 * carries no sparkline and no delta chip — its caption states the ceiling.
 */
const TILE_TONES = {
  people: "bg-secondary-soft text-secondary-ink",
  capacity: "bg-primary-soft text-primary-ink",
};

const OccupancySummary = ({ occupancy, stays = [] }) => {
  const grown = last24hNew(stays);
  const series = newPerDay(stays);

  const tiles = [
    {
      label: "Households",
      value: occupancy.families,
      Icon: Home,
      caption: "checked in now",
      tone: "people",
      delta: grown.households,
      spark: series.households,
    },
    {
      label: "Children",
      value: occupancy.children,
      Icon: Baby,
      caption: "under care",
      tone: "people",
      delta: grown.children,
      spark: series.children,
    },
    {
      label: "Adults",
      value: occupancy.adults,
      Icon: Users,
      caption: "in the facility",
      tone: "people",
      delta: grown.adults,
      spark: series.adults,
    },
    {
      label: "Capacity",
      value: occupancy.maxCapacity,
      Icon: Building2,
      caption: "total places",
      tone: "capacity",
      delta: null,
      spark: null,
    },
  ];

  return (
    <section
      aria-label="Occupancy breakdown"
      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2"
    >
      {tiles.map(({ label, value, Icon, caption, tone, delta, spark }) => (
        <div
          key={label}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4"
        >
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 items-center justify-center rounded-md ${TILE_TONES[tone]}`}
          >
            <Icon size={16} strokeWidth={1.9} />
          </span>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[22px] font-bold leading-none text-ink">
                <RollingNumber value={value} />
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-ink-soft">
                {label}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">{caption}</p>
            </div>
            {spark && <Sparkline values={spark} />}
          </div>

          {delta !== null && (
            <p className="text-right text-[11px] leading-none">
              <span
                className={`font-semibold ${
                  delta > 0 ? "text-primary-ink" : "text-muted"
                }`}
              >
                {`+${delta} New`}
              </span>
              <span className="ml-1 text-[10px] text-muted">last 24h</span>
            </p>
          )}
        </div>
      ))}
    </section>
  );
};

export default OccupancySummary;
