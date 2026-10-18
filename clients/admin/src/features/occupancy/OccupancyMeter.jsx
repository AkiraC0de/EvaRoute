import { Users, Armchair, Building2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { capacityState, checkinTrend, occupancyPct } from "./occupancyUtils";
import OccupancyTrendChart from "./OccupancyTrendChart";

/* Crypto/stock style delta badge: arrow + % against the prior week. */
const TREND_META = {
  up: { Icon: TrendingUp, tone: "text-success", srLabel: "up" },
  down: { Icon: TrendingDown, tone: "text-danger", srLabel: "down" },
  flat: { Icon: Minus, tone: "text-muted", srLabel: "flat" },
};

/**
 * Occupancy headline — the page's standout card: solid accent surface with
 * the live people/capacity numbers, a stock-card style 7-day check-in trend
 * (sparkline + delta pill), the plain-language state chip (never color alone)
 * and the capacity bar. Supporting details sit along the bottom.
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

  return (
    <section
      aria-label="Facility occupancy"
      className="relative overflow-hidden rounded-clay bg-accent p-5 shadow-clay"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        {/* Headline: icon + live number, delta + state pills on the right */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-clay-sm bg-white/20 text-white"
            >
              <Users size={20} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-white/80">
                People in facility
              </p>
              <p className="mt-1 text-[28px] font-bold leading-none text-white">
                {occupancy}
                <span className="ml-2 text-[13px] font-semibold text-white/80">
                  / {capacity} places taken
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {hasTrend ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold ${tone}`}
                title={`Check-ins ${srLabel}: ${trend.recent} this week vs ${trend.prior} the week before`}
              >
                <TrendIcon size={11} strokeWidth={2.5} aria-hidden="true" />
                {trend.delta > 0 ? "+" : ""}
                {trend.delta}%
                <span className="font-semibold text-muted">vs last wk</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white/80"
                title="Check-in trend is still loading or unavailable"
              >
                — <span className="font-semibold">trend pending</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white" />
              {state.label} · {pct}%
            </span>
          </div>
        </div>

        {/* 7-day check-in trend — the up/down graph */}
        <div className="mt-4">
          <OccupancyTrendChart timeline={timeline} />
          <p className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-white/70">
            <span>Check-ins · last 7 days</span>
            <span>
              {hasTrend
                ? `${trend.recent} this week · ${trend.prior} prior`
                : "Waiting for check-in data…"}
            </span>
          </p>
        </div>

        {/* Capacity */}
        <div
          role="progressbar"
          aria-label="Facility capacity"
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-valuenow={occupancy}
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25"
        >
          <div
            className="h-full min-w-[6px] rounded-full bg-white transition-[width] duration-500"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <Armchair size={12} strokeWidth={2} aria-hidden="true" />
            {remaining} seat{remaining === 1 ? "" : "s"} remaining
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 size={12} strokeWidth={2} aria-hidden="true" />
            {capacity} capacity
          </span>
        </div>
      </div>
    </section>
  );
};

export default OccupancyMeter;
