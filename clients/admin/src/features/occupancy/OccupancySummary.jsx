import RollingNumber from "../../components/ui/RollingNumber";
import Sparkline from "../../components/ui/Sparkline";
import { Home, Baby, Users, UsersRound } from "../../components/icons/evaIcons";
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
};

const OccupancySummary = ({ occupancy, stays = [] }) => {
  const grown = last24hNew(stays);
  const series = newPerDay(stays);
  // `unknown` renders "— New" (never a confident fake zero); `null` hides
  // the chip entirely (metrics with no growth concept, e.g. capacity).
  const deltaOf = (key) =>
    key === "individuals"
      ? grown
        ? grown.children + grown.adults
        : "unknown"
      : grown
        ? grown[key]
        : "unknown";

  const tiles = [
    {
      label: "Households",
      value: occupancy.families,
      Icon: Home,
      tone: "people",
      delta: deltaOf("households"),
      spark: series ? series.households : null,
    },
    {
      label: "Individuals",
      value: occupancy.members ?? occupancy.children + occupancy.adults,
      Icon: UsersRound,
      tone: "people",
      delta: deltaOf("individuals"),
      spark: series
        ? series.children.map((count, i) => count + series.adults[i])
        : null,
    },
    {
      label: "Children",
      value: occupancy.children,
      Icon: Baby,
      tone: "people",
      delta: deltaOf("children"),
      spark: series ? series.children : null,
    },
    {
      label: "Adults",
      value: occupancy.adults,
      Icon: Users,
      tone: "people",
      delta: deltaOf("adults"),
      spark: series ? series.adults : null,
    },
  ];

  return (
    <section
      aria-label="Occupancy breakdown"
      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2"
    >
      {tiles.map(({ label, value, Icon, tone, delta, spark }) => (
        <div
          key={label}
          className="flex gap-3 justify-between rounded-lg border border-line bg-surface p-4"
        >
          

          <div className="flex flex-col gap-2">
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 items-center justify-center rounded-full ${TILE_TONES[tone]}`}
            >
              <Icon size={16} strokeWidth={1.9} />
            </span>
            <div>
              <p className="mt-1.5 text-[11px] font-medium uppercase text-ink-soft">
                {label}
              </p>
              <p className="text-[28px] font-bold leading-none text-ink">
                <RollingNumber value={value} />
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-end">
            {spark && <Sparkline values={spark} />}
            {delta !== null && (
              <p className="text-right text-[11px] leading-none">
                <span
                  className={`font-semibold ${
                    typeof delta !== "number" || delta > 0
                      ? "text-primary-ink"
                      : "text-muted"
                  }`}
                >
                  {typeof delta === "number" ? `+${delta} New` : "— New"}
                </span>
                <span className="ml-1 text-[10px] text-muted">last 24h</span>
              </p>
            )}
          </div>
          
        </div>
      ))}
    </section>
  );
};

export default OccupancySummary;
