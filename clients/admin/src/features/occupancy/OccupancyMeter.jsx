import { Users, Armchair, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { capacityState, checkinTrend, occupancyPct } from "./occupancyUtils";
import OccupancyTrendChart from "./OccupancyTrendChart";

/* Crypto/stock style delta badge: arrow + % against the prior week. */
const TREND_META = {
  up: { Icon: TrendingUp, tone: "text-success", srLabel: "up" },
  down: { Icon: TrendingDown, tone: "text-danger", srLabel: "down" },
  flat: { Icon: Minus, tone: "text-muted", srLabel: "flat" },
};

/**
 * Occupancy hero — the page's centerpiece on the "Stats Card" anatomy:
 * header row (icon + label + state chip), an oversized metric with its
 * caption, a delta line, then the 7-day chart and the capacity bar.
 * Flat navy operational panel (occupancy/capacity = the primary category) —
 * solid fill, no glow, no elevation; supporting details stay along the
 * bottom. Never color alone — the state chip carries the words.
 */
const OccupancyMeter = ({ occupancy, capacity, timeline }) => {
  const pct = occupancyPct(occupancy, capacity);
  const state = capacityState(occupancy, capacity);
  const remaining = Math.max(0, capacity - occupancy);
  // `timeline === null` means no stats loaded yet (loading or request
  // failed) — show "—" instead of a confident fake zero.
  const hasTrend = Array.isArray(timeline);
  const trend = checkinTrend(hasTrend ? timeline : []);
  const { Icon: TrendIcon, tone, srLabel } = TREND_META[trend.direction];
  const stateDot =
    state.tone === "danger" ? "bg-danger" : state.tone === "warning" ? "bg-warning" : "bg-success";

  return (
    <section
      aria-label="Facility occupancy"
      className="flex h-full flex-col overflow-hidden rounded-lg bg-primary p-5"
    >
      <div className="flex h-full flex-col">
        {/* Header row: icon + label left, state chip right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/20 text-white"
            >
              <Users size={17} strokeWidth={1.9} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.8px] text-white/85">
              People in facility
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ink-soft">
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${stateDot}`} />
            {state.label}
          </span>
        </div>

        {/* Oversized metric + caption */}
        <p className="mt-3.5 text-[40px] font-bold leading-none text-white">
          {occupancy}
          <span className="ml-2.5 text-[14px] font-semibold text-white/80">
            of {capacity} places taken
          </span>
        </p>

        {/* Delta line: week-over-week check-in trend */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-white/85">
          {hasTrend ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold ${tone}`}
              title={`Check-ins ${srLabel}: ${trend.recent} this week vs ${trend.prior} the week before`}
            >
              <TrendIcon size={11} strokeWidth={2.5} aria-hidden="true" />
              {trend.delta > 0 ? "+" : ""}
              {trend.delta}%
              <span className="font-semibold text-muted">vs last week</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white/80"
              title="Check-in trend is still loading or unavailable"
            >
              — <span className="font-semibold">trend pending</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
            {hasTrend
              ? `${trend.recent} check-in${trend.recent === 1 ? "" : "s"} this week · ${trend.prior} prior`
              : "Waiting for check-in data…"}
          </span>
        </div>

        {/* 7-day check-in trend with day labels */}
        <div className="mt-3">
          <OccupancyTrendChart timeline={timeline} />
        </div>

        {/* Capacity bar + footer labels (labels annotate the bar) */}
        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] font-semibold text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <Armchair size={12} strokeWidth={2} aria-hidden="true" />
              {remaining} place{remaining === 1 ? "" : "s"} remaining
            </span>
            <span>{pct}% full</span>
          </div>
          <div
            role="progressbar"
            aria-label="Facility capacity"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={occupancy}
            className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/25"
          >
            <div
              className="h-full min-w-[6px] rounded-full bg-white transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccupancyMeter;
