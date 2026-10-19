import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

/** Mini tooltip in the app's clay language (mirrors components/ui/Chart.jsx). */
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-clay-sm border border-line bg-surface px-2.5 py-1.5 shadow-clay">
      <p className="text-[10px] font-semibold text-muted">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold text-ink">
        {payload[0]?.value ?? 0} check-ins
      </p>
    </div>
  );
};

/**
 * Stock-card style sparkline: the last 7 days of check-ins as a soft area
 * line on the meter's accent surface (shadcn Chart pattern, recharts base).
 * The exact counts live in the tooltip and in the accessible label — the
 * trend pill next to it carries the summary.
 */
const OccupancyTrendChart = ({ timeline }) => {
  // useActivityStats reports `timeline: null` while loading — a default
  // parameter only catches undefined, so normalize explicitly.
  const days = Array.isArray(timeline) ? timeline : [];
  const points = days.slice(-7).map((day) => ({
    label: new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    checkIns: day.checkIns ?? 0,
  }));

  return (
    <div
      role="img"
      aria-label={`Check-ins over the last ${points.length} days: ${
        points.map((point) => point.checkIns).join(", ") || "no data"
      }`}
      className="h-24 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="occupancyTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-surface)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-surface)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 600 }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.5)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="checkIns"
            stroke="var(--color-surface)"
            strokeWidth={2}
            fill="url(#occupancyTrendFill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: "var(--color-surface)",
              stroke: "var(--color-accent)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyTrendChart;
